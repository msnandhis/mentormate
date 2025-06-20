import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Video, Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle, CheckCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, Mentor } from '../../lib/supabase';
import { tavusAPI, generateMentorVideo, pollVideoStatus } from '../../lib/tavus';
import { VideoPlayer } from './VideoPlayer';

interface LiveVideoInterfaceProps {
  mentor: Mentor;
  onClose?: () => void;
}

interface VideoState {
  status: 'idle' | 'generating' | 'ready' | 'error';
  videoUrl?: string;
  error?: string;
  progress: number;
}

export const LiveVideoInterface: React.FC<LiveVideoInterfaceProps> = ({
  mentor,
  onClose
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [videoState, setVideoState] = useState<VideoState>({
    status: 'idle',
    progress: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'mentor';
    content: string;
    videoUrl?: string;
    timestamp: Date;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const health = await tavusAPI.checkHealth();
      if (health.status === 'mock') {
        setApiStatus('error');
      } else {
        setApiStatus('connected');
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  const generateVideo = async (userMessage: string) => {
    if (apiStatus !== 'connected') {
      setVideoState({
        status: 'error',
        error: 'API not connected. Please check your Tavus API configuration.',
        progress: 0
      });
      return;
    }

    setVideoState({ status: 'generating', progress: 0 });

    try {
      // Add user message to history
      setConversationHistory(prev => [...prev, {
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      }]);

      // Generate mentor response text
      const mentorResponse = await generateMentorResponseText(userMessage, mentor);

      // Start video generation
      console.log('Generating video with Tavus API...');
      const videoResponse = await generateMentorVideo(
        mentor.name,
        mentor.avatar_config || {},
        mentorResponse,
        mentor.avatar_config?.voice_settings
      );

      console.log('Video generation started:', videoResponse);

      // Simulate progress updates
      let progress = 10;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress < 90) {
          setVideoState(prev => ({ ...prev, progress: Math.min(progress, 90) }));
        }
      }, 2000);

      // Poll for completion
      const completedVideo = await pollVideoStatus(
        videoResponse.video_id,
        (video) => {
          clearInterval(progressInterval);
          setVideoState({
            status: 'ready',
            videoUrl: video.video_url,
            progress: 100
          });

          // Add mentor response to history
          setConversationHistory(prev => [...prev, {
            type: 'mentor',
            content: mentorResponse,
            videoUrl: video.video_url,
            timestamp: new Date()
          }]);

          console.log('Video generation completed:', video);
        },
        (error) => {
          clearInterval(progressInterval);
          setVideoState({
            status: 'error',
            error: `Video generation failed: ${error}`,
            progress: 0
          });
        }
      );

    } catch (error) {
      console.error('Error generating video:', error);
      setVideoState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate video',
        progress: 0
      });
    }
  };

  const generateMentorResponseText = async (userMessage: string, mentor: Mentor): Promise<string> => {
    // Generate contextual response based on mentor personality
    const responses = {
      'ZenKai': [
        `Thank you for sharing that with me. ${userMessage.includes('stress') || userMessage.includes('anxious') ? 'I sense some tension in your words. Let\'s take a moment to breathe together.' : 'I appreciate your openness and presence in this moment.'} How are you feeling right now, in your body and mind?`,
        `That's a beautiful insight you've shared. ${userMessage.includes('goal') || userMessage.includes('want') ? 'I can feel your intention behind these words. What would bring you the most peace on this journey?' : 'What intention would you like to set for yourself today?'}`,
      ],
      'Coach Lex': [
        `YES! I love that energy! ${userMessage.includes('workout') || userMessage.includes('exercise') ? 'You\'re already thinking like a champion! Let\'s turn that motivation into action.' : 'That\'s the mindset that separates winners from everyone else!'} What\'s your next move going to be? 💪`,
        `You\'re crushing it already just by showing up! ${userMessage.includes('tired') || userMessage.includes('hard') ? 'I hear you, but that\'s when champions are made - when it gets tough!' : 'Keep that momentum going!'} How can we level up your game today?`,
      ],
      'Prof. Ada': [
        `Excellent question! Let's analyze this systematically. ${userMessage.includes('study') || userMessage.includes('learn') ? 'I can see you\'re approaching this with the right analytical mindset.' : 'Your critical thinking skills are showing.'} What patterns do you notice in your approach?`,
        `That's a valuable data point you've shared. ${userMessage.includes('problem') || userMessage.includes('challenge') ? 'Let\'s break this down into manageable components and create a strategic framework.' : 'How does this connect to your larger learning objectives?'}`,
      ],
      'No-BS Tony': [
        `Alright, let's cut through the noise. ${userMessage.includes('maybe') || userMessage.includes('think') ? 'I hear a lot of thinking, but I need to see action. What are you actually going to DO about this?' : 'I appreciate the directness. Now what\'s your next concrete step?'}`,
        `Good. You're being honest with yourself. ${userMessage.includes('goal') || userMessage.includes('want') ? 'But wanting isn\'t enough. What\'s your timeline? What\'s your plan?' : 'Now stop talking and start executing. What measurable result are you committing to?'}`,
      ]
    };

    const mentorResponses = responses[mentor.name as keyof typeof responses] || [
      `Thank you for sharing that. I'm here to support you on your journey. How can I help you move forward today?`
    ];

    return mentorResponses[Math.floor(Math.random() * mentorResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setMessage('');
    await generateVideo(userMessage);
  };

  const handleRetry = () => {
    setVideoState({ status: 'idle', progress: 0 });
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return 'Tavus API Connected';
      case 'error':
        return 'API Connection Failed';
      default:
        return 'Checking API...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${mentor.gradient || 'from-primary-500 to-primary-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl">
                  Live Video with {mentor.name}
                </h2>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  {getStatusIcon()}
                  <span>{getStatusText()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4 relative">
              {videoState.status === 'idle' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${mentor.gradient} flex items-center justify-center`}>
                      <span className="text-2xl font-bold">{mentor.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{mentor.name}</h3>
                    <p className="text-gray-300">Send a message to start the conversation</p>
                  </div>
                </div>
              )}

              {videoState.status === 'generating' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold mb-2">Generating Video...</h3>
                    <p className="text-gray-300 mb-4">{mentor.name} is creating your personalized response</p>
                    <div className="w-64 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${videoState.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{Math.round(videoState.progress)}% complete</p>
                  </div>
                </div>
              )}

              {videoState.status === 'ready' && videoState.videoUrl && (
                <VideoPlayer
                  src={videoState.videoUrl}
                  title={`${mentor.name} Response`}
                  autoPlay={true}
                  className="w-full h-full"
                />
              )}

              {videoState.status === 'error' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-white max-w-md">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h3 className="text-xl font-semibold mb-2 text-red-400">Generation Failed</h3>
                    <p className="text-gray-300 mb-4">{videoState.error}</p>
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Send a message to ${mentor.name}...`}
                disabled={videoState.status === 'generating' || apiStatus !== 'connected'}
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || videoState.status === 'generating' || apiStatus !== 'connected'}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {videoState.status === 'generating' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Video className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="w-80 border-l border-border p-4 overflow-y-auto bg-gray-50">
            <h3 className="font-heading font-semibold mb-4">Conversation</h3>
            
            {conversationHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversationHistory.map((msg, index) => (
                  <div key={index} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white border border-border'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      {msg.videoUrl && (
                        <div className="mt-2 text-xs opacity-75">
                          📹 Video response generated
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Status Bar */}
        {apiStatus !== 'connected' && (
          <div className={`p-3 ${apiStatus === 'error' ? 'bg-red-50 border-t border-red-200' : 'bg-yellow-50 border-t border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${apiStatus === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {apiStatus === 'error' 
                    ? 'Tavus API not configured. Please add your API key in Settings.' 
                    : 'Checking API connection...'
                  }
                </span>
              </div>
              {apiStatus === 'error' && (
                <button
                  onClick={checkApiConnection}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};