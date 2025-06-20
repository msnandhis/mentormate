import React, { useState, useRef } from 'react';
import { Upload, Video, Mic, Check, AlertCircle, X } from 'lucide-react';
import { tavusAPI, TavusAvatar } from '../../lib/tavus';

interface AvatarCreationWizardProps {
  onComplete: (avatar: TavusAvatar) => void;
  onCancel: () => void;
}

type WizardStep = 'upload' | 'processing' | 'complete' | 'error';

export const AvatarCreationWizard: React.FC<AvatarCreationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [avatarName, setAvatarName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdAvatar, setCreatedAvatar] = useState<TavusAvatar | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Preview video
    if (videoPreviewRef.current) {
      videoPreviewRef.current.src = URL.createObjectURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const createAvatar = async () => {
    if (!selectedFile || !avatarName.trim()) {
      setError('Please provide both a name and video file.');
      return;
    }

    setCurrentStep('processing');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const avatar = await tavusAPI.createAvatar(avatarName.trim(), selectedFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      setCreatedAvatar(avatar);
      setCurrentStep('complete');

      // If avatar is immediately ready, complete the process
      if (avatar.status === 'ready') {
        setTimeout(() => {
          onComplete(avatar);
        }, 2000);
      } else {
        // Poll for completion
        pollAvatarStatus(avatar.avatar_id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create avatar');
      setCurrentStep('error');
    }
  };

  const pollAvatarStatus = async (avatarId: string) => {
    const checkStatus = async () => {
      try {
        const avatar = await tavusAPI.getAvatar(avatarId);
        
        if (avatar.status === 'ready') {
          setCreatedAvatar(avatar);
          onComplete(avatar);
        } else if (avatar.status === 'error') {
          setError('Avatar training failed. Please try again.');
          setCurrentStep('error');
        } else {
          // Continue polling
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        setError('Failed to check avatar status');
        setCurrentStep('error');
      }
    };

    setTimeout(checkStatus, 5000);
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setAvatarName('');
    setSelectedFile(null);
    setProgress(0);
    setError(null);
    setCreatedAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-2xl text-foreground">
            Create Custom Avatar
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'upload' ? 'bg-primary text-white' : 
              ['processing', 'complete'].includes(currentStep) ? 'bg-success text-white' : 
              'bg-neutral-200 text-neutral-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${
              ['processing', 'complete'].includes(currentStep) ? 'bg-success' : 'bg-neutral-200'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'processing' ? 'bg-primary text-white' : 
              currentStep === 'complete' ? 'bg-success text-white' : 
              'bg-neutral-200 text-neutral-600'
            }`}>
              2
            </div>
            <div className={`h-1 w-16 ${
              currentStep === 'complete' ? 'bg-success' : 'bg-neutral-200'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'complete' ? 'bg-success text-white' : 
              'bg-neutral-200 text-neutral-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div>
              <label className="block font-body font-medium text-foreground mb-2">
                Avatar Name
              </label>
              <input
                type="text"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="My Custom Avatar"
                className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block font-body font-medium text-foreground mb-2">
                Training Video
              </label>
              
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="font-body font-semibold text-foreground mb-2">
                    Upload Training Video
                  </h3>
                  <p className="font-body text-neutral-600 mb-4">
                    Drag and drop your video here, or click to browse
                  </p>
                  <p className="font-body text-sm text-neutral-500">
                    MP4, MOV, or AVI • Max 100MB • 30 seconds to 2 minutes recommended
                  </p>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Video className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-body font-medium text-foreground">
                          {selectedFile.name}
                        </p>
                        <p className="font-body text-sm text-neutral-600">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <video
                    ref={videoPreviewRef}
                    controls
                    className="w-full aspect-video bg-black rounded-lg"
                  />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="font-body text-red-700">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={onCancel}
                className="font-body px-6 py-3 text-neutral-600 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAvatar}
                disabled={!selectedFile || !avatarName.trim()}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Avatar
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
              Creating Your Avatar
            </h3>
            <p className="font-body text-neutral-600 mb-6">
              Processing your video and training the AI model...
            </p>

            <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="font-body text-sm text-neutral-600">
              {progress}% complete • This usually takes 5-10 minutes
            </p>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="font-heading font-bold text-xl text-foreground mb-2">
              Avatar Created Successfully!
            </h3>
            <p className="font-body text-neutral-600 mb-6">
              {createdAvatar?.avatar_name} is ready to use in your mentor sessions.
            </p>

            {createdAvatar?.status === 'training' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="font-body text-blue-700 text-sm">
                  Your avatar is still training. You'll receive an email when it's ready to use.
                </p>
              </div>
            )}

            <button
              onClick={() => onComplete(createdAvatar!)}
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
              Creation Failed
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