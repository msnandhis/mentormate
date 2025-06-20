import React, { useState, useRef } from 'react';
import { Mic, MicOff, Upload, Play, Trash2, Check, AlertCircle, X } from 'lucide-react';
import { tavusAPI, TavusVoiceCloneResponse } from '../../lib/tavus';

interface VoiceRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  transcript?: string;
}

interface VoiceCloningWizardProps {
  onComplete: (voiceClone: TavusVoiceCloneResponse) => void;
  onCancel: () => void;
}

type WizardStep = 'instructions' | 'recording' | 'review' | 'processing' | 'complete' | 'error';

const sampleTexts = [
  "Hello, I'm your personal AI mentor. I'm here to help you achieve your goals and stay accountable every day.",
  "Great job on completing your check-in today! Your consistency is really paying off, and I can see you're making excellent progress.",
  "Remember, building new habits takes time and patience. Don't be too hard on yourself if you have an off day - what matters is getting back on track.",
  "Let's focus on your goals for tomorrow. What's one specific action you can take to move closer to your objectives?",
  "I believe in your ability to create positive change in your life. Stay committed to your vision and trust the process.",
];

export const VoiceCloningWizard: React.FC<VoiceCloningWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('instructions');
  const [voiceName, setVoiceName] = useState('');
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [createdVoice, setCreatedVoice] = useState<TavusVoiceCloneResponse | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording: VoiceRecording = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          transcript: sampleTexts[currentTextIndex],
        };

        setRecordings(prev => [...prev, newRecording]);
        
        // Move to next text
        if (currentTextIndex < sampleTexts.length - 1) {
          setCurrentTextIndex(prev => prev + 1);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    
    // Adjust current text index if needed
    const deletedIndex = recordings.findIndex(r => r.id === id);
    if (deletedIndex !== -1 && deletedIndex <= currentTextIndex) {
      setCurrentTextIndex(Math.max(0, currentTextIndex - 1));
    }
  };

  const playRecording = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return recordings.reduce((total, r) => total + r.duration, 0);
  };

  const canProceed = () => {
    const totalDuration = getTotalDuration();
    return recordings.length >= 3 && totalDuration >= 60; // At least 3 recordings, 60 seconds total
  };

  const createVoiceClone = async () => {
    if (!voiceName.trim() || recordings.length === 0) {
      setError('Please provide a voice name and recordings.');
      return;
    }

    setCurrentStep('processing');
    setProcessingProgress(0);

    try {
      const audioFiles = recordings.map(recording => 
        new File([recording.blob], `voice_sample_${recording.id}.wav`, { type: 'audio/wav' })
      );

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);

      const voiceClone = await tavusAPI.createVoiceClone({
        voice_name: voiceName.trim(),
        voice_samples: audioFiles,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);
      setCreatedVoice(voiceClone);
      setCurrentStep('complete');

      // If voice is immediately ready, complete the process
      if (voiceClone.status === 'ready') {
        setTimeout(() => {
          onComplete(voiceClone);
        }, 2000);
      } else {
        // Poll for completion
        pollVoiceStatus(voiceClone.voice_id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create voice clone');
      setCurrentStep('error');
    }
  };

  const pollVoiceStatus = async (voiceId: string) => {
    const checkStatus = async () => {
      try {
        const voiceClone = await tavusAPI.getVoiceClone(voiceId);
        
        if (voiceClone.status === 'ready') {
          setCreatedVoice(voiceClone);
          onComplete(voiceClone);
        } else if (voiceClone.status === 'error') {
          setError('Voice training failed. Please try again.');
          setCurrentStep('error');
        } else {
          // Update progress if available
          if (voiceClone.training_progress) {
            setProcessingProgress(voiceClone.training_progress);
          }
          // Continue polling
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        setError('Failed to check voice status');
        setCurrentStep('error');
      }
    };

    setTimeout(checkStatus, 5000);
  };

  const resetWizard = () => {
    setCurrentStep('instructions');
    setVoiceName('');
    setRecordings([]);
    setCurrentTextIndex(0);
    setError(null);
    setProcessingProgress(0);
    setCreatedVoice(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-2xl text-foreground">
            Create Voice Clone
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            {['Instructions', 'Recording', 'Review', 'Complete'].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  ['instructions', 'recording', 'review', 'processing', 'complete'].indexOf(currentStep) >= index
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`h-1 w-8 ${
                    ['instructions', 'recording', 'review', 'processing', 'complete'].indexOf(currentStep) > index
                      ? 'bg-primary' 
                      : 'bg-neutral-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        {currentStep === 'instructions' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                Voice Cloning Instructions
              </h3>
              <p className="font-body text-neutral-600">
                Create a personalized voice for your custom mentor by recording sample texts.
              </p>
            </div>

            <div>
              <label className="block font-body font-medium text-foreground mb-2">
                Voice Name
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="My Voice Clone"
                className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                maxLength={50}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-heading font-semibold text-blue-800 mb-4">
                Recording Guidelines
              </h4>
              <ul className="font-body text-blue-700 space-y-2">
                <li>• Record in a quiet environment with minimal background noise</li>
                <li>• Speak clearly and at a natural pace</li>
                <li>• Use your normal speaking voice - don't exaggerate</li>
                <li>• We need at least 3 recordings totaling 60+ seconds</li>
                <li>• More recordings (up to 10) will improve voice quality</li>
              </ul>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={onCancel}
                className="font-body px-6 py-3 text-neutral-600 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setCurrentStep('recording')}
                disabled={!voiceName.trim()}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Recording
              </button>
            </div>
          </div>
        )}

        {currentStep === 'recording' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Record Voice Samples
              </h3>
              <p className="font-body text-neutral-600">
                {recordings.length} of {sampleTexts.length} samples recorded
              </p>
            </div>

            {/* Current Text */}
            <div className="bg-accent rounded-lg p-6">
              <h4 className="font-body font-medium text-foreground mb-3">
                Read this text aloud:
              </h4>
              <p className="font-body text-lg text-foreground leading-relaxed">
                "{sampleTexts[currentTextIndex]}"
              </p>
            </div>

            {/* Recording Controls */}
            <div className="text-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={currentTextIndex >= sampleTexts.length}
                  className="flex items-center space-x-3 font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
                >
                  <Mic className="w-6 h-6" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-body text-lg font-medium text-foreground">
                      Recording... {formatTime(recordingTime)}
                    </span>
                  </div>
                  
                  <button
                    onClick={stopRecording}
                    className="flex items-center space-x-3 font-body px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mx-auto"
                  >
                    <MicOff className="w-6 h-6" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recordings List */}
            {recordings.length > 0 && (
              <div>
                <h4 className="font-body font-medium text-foreground mb-3">
                  Recorded Samples ({getTotalDuration()}s total)
                </h4>
                <div className="space-y-2">
                  {recordings.map((recording, index) => (
                    <div key={recording.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-body font-medium text-foreground">
                          Sample {index + 1}
                        </span>
                        <span className="font-body text-sm text-neutral-600">
                          {formatTime(recording.duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => playRecording(recording.url)}
                          className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRecording(recording.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('instructions')}
                className="font-body px-6 py-3 text-neutral-600 hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('review')}
                disabled={!canProceed()}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Review & Create
              </button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Review Your Voice Clone
              </h3>
              <p className="font-body text-neutral-600">
                Check your recordings before creating the voice clone.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-body font-medium text-foreground mb-3">
                  Voice Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-body text-neutral-600">Name:</span>
                    <span className="font-body text-foreground">{voiceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-neutral-600">Samples:</span>
                    <span className="font-body text-foreground">{recordings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-neutral-600">Duration:</span>
                    <span className="font-body text-foreground">{formatTime(getTotalDuration())}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-body font-medium text-foreground mb-3">
                  Quality Check
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="font-body text-sm text-success">Minimum samples met</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="font-body text-sm text-success">Minimum duration met</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="font-body text-sm text-success">Audio quality good</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-warning-50 rounded-lg p-4 border border-warning-200">
              <p className="font-body text-warning-700 text-sm">
                <strong>Note:</strong> Voice training typically takes 10-15 minutes. 
                You'll receive an email when your voice clone is ready to use.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('recording')}
                className="font-body px-6 py-3 text-neutral-600 hover:text-foreground transition-colors"
              >
                Back to Recording
              </button>
              <button
                onClick={createVoiceClone}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create Voice Clone
              </button>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">
              Training Your Voice
            </h3>
            <p className="font-body text-neutral-600 mb-6">
              Processing your voice samples and training the AI model...
            </p>

            <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            
            <p className="font-body text-sm text-neutral-600">
              {processingProgress}% complete • This usually takes 10-15 minutes
            </p>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">
              Voice Clone Created!
            </h3>
            <p className="font-body text-neutral-600 mb-6">
              Your voice clone "{voiceName}" is ready to use in your custom avatars.
            </p>

            <button
              onClick={() => onComplete(createdVoice!)}
              className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">
              Voice Training Failed
            </h3>
            <p className="font-body text-neutral-600 mb-6">
              {error}
            </p>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={resetWizard}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onCancel}
                className="font-body px-6 py-3 text-neutral-600 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};