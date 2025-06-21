import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Minimize2, Video, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatSessions, chatMessages, mentors, ChatSession, ChatMessage, Mentor } from '../../lib/supabase';
import { generateMentorVideo, tavusAPI } from '../../lib/tavus';
import { generateAIChatResponse } from '../../lib/ai-mentor';
import { VoiceRecorder } from './VoiceRecorder';
import { MentorAvatar } from './MentorAvatar';
import { VideoPlayer } from '../video/VideoPlayer';

interface EnhancedChatInterfaceProps {
  mentor?: Mentor;
  onClose?: () => void;
  onMinimize?: () => void;
  minimized?: boolean;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  mentor: initialMentor,
  onClose,
  onMinimize,
  minimized = false,
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [mentor, setMentor] = useState<Mentor | null>(initialMentor || null);
  const [loading, setLoading] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mentor && user && !initialized) {
      initializeSession();
    }
  }, [mentor, user, initialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session && !initialized) {
      const subscription = chatMessages.subscribeToSession(session.id, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        if (newMessage.sender_type === 'mentor') {
          setIsTyping(false);
          setGeneratingVideo(false);
          if (voiceEnabled && newMessage.voice_url) {
            playVoiceMessage(newMessage.voice_url);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session, voiceEnabled, initialized]);

  const initializeSession = async () => {
    if (!user?.id || !mentor || initialized) return;

    setLoading(true);
    try {
      const { data: newSession } = await chatSessions.create({
        user_id: user.id,
        mentor_id: mentor.id,
        session_type: videoEnabled ? 'video' : voiceEnabled ? 'voice' : 'text',
      });

      if (newSession) {
        setSession(newSession);
        setIsConnected(true);
        setInitialized(true);
        
        // Load any existing messages first
        const { messages: sessionMessages } = await chatMessages.getBySession(newSession.id);
        setMessages(sessionMessages);

        // Add immediate welcome message to state (don't wait for database)
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          session_id: newSession.id,
          sender_type: 'mentor',
          message_type: 'text',
          content: getWelcomeMessage(mentor),
          created_at: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, welcomeMessage]);

        // Then save to database and potentially generate video
        setTimeout(async () => {
          await sendMentorMessage(getWelcomeMessage(mentor), videoEnabled);
        }, 1000);
      }
    } catch (error) {
      console.error('Error initializing chat session:', error);
      // Add error message to UI
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        session_id: 'error',
        sender_type: 'system',
        message_type: 'text',
        content: 'Sorry, there was an issue connecting. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = (mentor: Mentor): string => {
    const welcomeMessages = {
      'Coach Lex': "Hey there! 💪 I'm Coach Lex, your fitness mentor! Ready to crush some goals together? I'm here to keep you motivated and moving. What's your fitness focus today?",
      'ZenKai': "Hello, and welcome. I'm ZenKai, your mindful wellness guide. I'm here to help you find balance and peace in your daily journey. Take a deep breath, and let's explore how I can support your well-being today.",
      'Prof. Ada': "Greetings! I'm Professor Ada, your study and learning mentor. I'm here to help you optimize your learning strategies and boost your productivity. What academic or learning goals would you like to tackle today?",
      'No-BS Tony': "Alright, let's cut to the chase. I'm Tony, your no-nonsense career coach. I'm here to push you toward real results and professional growth. What career goal are we going to make happen today?",
    };

    return welcomeMessages[mentor.name as keyof typeof welcomeMessages] || 
           `Hello! I'm ${mentor.name}, your ${mentor.category} mentor. I'm here to provide real-time guidance and support. How can I help you achieve your goals today?`;
  };

  const sendMessage = async (content: string, messageType: 'text' | 'voice' = 'text', voiceUrl?: string) => {
    if (!session || !content.trim()) return;

    try {
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        session_id: session.id,
        sender_type: 'user',
        message_type: messageType,
        content: content.trim(),
        voice_url: voiceUrl,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Save to database
      await chatMessages.create({
        session_id: session.id,
        sender_type: 'user',
        message_type: messageType,
        content: content.trim(),
        voice_url: voiceUrl,
      });

      setNewMessage('');
      setIsTyping(true);

      // Generate AI mentor response with conversation history
      const conversationHistory = messages.slice(-10); // Get last 10 messages for context
      const mentorResponse = await generateAIChatResponse(
        mentor, 
        content, 
        conversationHistory,
        user?.id
      );
      
      await sendMentorMessage(mentorResponse, videoEnabled);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        session_id: session.id,
        sender_type: 'system',
        message_type: 'text',
        content: 'Sorry, I encountered an issue. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const sendMentorMessage = async (content: string, generateVideo = false) => {
    if (!session || !mentor) return;

    try {
      let videoUrl = undefined;

      // Generate video response if enabled and mentor supports it
      if (generateVideo && mentor.avatar_config) {
        setGeneratingVideo(true);
        try {
          console.log(`Generating video for ${mentor.name} with content:`, content);
          const videoResponse = await generateMentorVideo(
            mentor.name,
            mentor.avatar_config,
            content,
            mentor.avatar_config.voice_settings
          );

          if (videoResponse.video_url) {
            videoUrl = videoResponse.video_url;
          }
        } catch (videoError) {
          console.error('Error generating video:', videoError);
          // Continue without video
        }
      }

      // Add mentor message to UI
      const mentorMessage: ChatMessage = {
        id: `mentor-${Date.now()}`,
        session_id: session.id,
        sender_type: 'mentor',
        message_type: videoUrl ? 'video' : 'text',
        content,
        voice_url: videoUrl,
        metadata: {
          video_url: videoUrl,
          mentor_avatar_config: mentor.avatar_config,
          ai_generated: true,
          model_used: 'gpt-4o-mini',
        },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, mentorMessage]);
      setIsTyping(false);
      setGeneratingVideo(false);

      // Save to database
      await chatMessages.create({
        session_id: session.id,
        sender_type: 'mentor',
        message_type: videoUrl ? 'video' : 'text',
        content,
        voice_url: videoUrl,
        metadata: {
          video_url: videoUrl,
          mentor_avatar_config: mentor.avatar_config,
          ai_generated: true,
          model_used: 'gpt-4o-mini',
        },
      });

    } catch (error) {
      console.error('Error sending mentor message:', error);
      setIsTyping(false);
      setGeneratingVideo(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob, transcript: string) => {
    await sendMessage(transcript, 'voice', 'mock-voice-url');
  };

  const playVoiceMessage = (voiceUrl: string) => {
    console.log('Playing voice message:', voiceUrl);
  };

  const endSession = async () => {
    if (session) {
      await chatSessions.end(session.id);
      setIsConnected(false);
      onClose?.();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onMinimize}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white hover:opacity-90 transition-all ${
            mentor?.gradient ? `bg-gradient-to-br ${mentor.gradient}` : 'bg-primary'
          }`}
        >
          <div className="relative">
            {mentor && <MentorAvatar mentor={mentor} size="small" />}
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white" />
            )}
          </div>
        </button>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <h2 className="font-heading font-bold text-xl text-foreground mb-4">
            Select a Mentor
          </h2>
          <p className="font-body text-neutral-600 mb-6">
            Choose a mentor to start your real-time video conversation.
          </p>
          <button
            onClick={onClose}
            className="w-full font-body px-6 py-3 bg-neutral-200 text-foreground rounded-lg hover:bg-neutral-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isZenKai = mentor.name === 'ZenKai';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[700px] mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${mentor.gradient || 'from-primary-500 to-primary-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MentorAvatar mentor={mentor} size="medium" />
              <div>
                <h2 className="font-heading font-bold text-lg flex items-center space-x-2">
                  <span>{mentor.name}</span>
                  {isZenKai && <Sparkles className="w-5 h-5" />}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  <span className="font-body text-sm opacity-90">
                    {isConnected ? 'Live AI Chat' : 'Connecting...'}
                  </span>
                  {videoEnabled && (
                    <>
                      <span className="opacity-50">•</span>
                      <Video className="w-4 h-4" />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  videoEnabled ? 'bg-white/20' : 'bg-white/10'
                }`}
                title={videoEnabled ? 'Disable video responses' : 'Enable video responses'}
              >
                <Video className="w-5 h-5" />
              </button>

              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              {onMinimize && (
                <button
                  onClick={onMinimize}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={endSession}
                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="font-body text-neutral-600">
                  Connecting to {mentor.name}...
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'}`}>
                    {isZenKai ? (
                      <Sparkles className="w-8 h-8 text-white" />
                    ) : (
                      <span className="font-heading font-bold text-white text-xl">
                        {mentor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    Welcome to AI Chat with {mentor.name}
                  </h3>
                  <p className="font-body text-neutral-600">
                    {isZenKai 
                      ? 'Your mindful wellness guide powered by advanced AI is ready to help you find balance and peace.'
                      : `Your ${mentor.category} mentor powered by AI is ready to provide personalized guidance.`
                    }
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-lg ${
                      message.sender_type === 'user'
                        ? 'bg-primary text-white'
                        : message.sender_type === 'system'
                        ? 'bg-neutral-100 text-neutral-600 text-center text-sm'
                        : 'bg-white text-foreground shadow-sm border'
                    }`}
                  >
                    {/* Video Message */}
                    {message.metadata?.video_url && (
                      <div className="mb-3">
                        <VideoPlayer
                          src={message.metadata.video_url}
                          title={`${mentor.name} Response`}
                          className="aspect-video max-w-sm rounded-lg"
                          autoPlay={true}
                        />
                      </div>
                    )}

                    <p className="font-body">{message.content}</p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        message.sender_type === 'user' ? 'text-white/70' : 'text-neutral-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                      
                      {/* AI indicator for mentor messages */}
                      {message.sender_type === 'mentor' && message.metadata?.ai_generated && (
                        <span className="text-xs text-blue-600 font-medium flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(isTyping || generatingVideo) && (
                <div className="flex justify-start">
                  <div className="bg-white text-foreground px-4 py-3 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="font-body text-sm">
                        {generatingVideo ? `${mentor.name} is creating an AI video response...` : `${mentor.name} is thinking...`}
                      </span>
                      {generatingVideo && isZenKai && <Sparkles className="w-4 h-4 text-blue-500" />}
                      <div className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)}
                placeholder={`Message ${mentor.name}...`}
                disabled={!isConnected}
                className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>

            <VoiceRecorder
              onRecordingComplete={handleVoiceMessage}
              disabled={!isConnected}
            />

            <button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || !isConnected}
              className="p-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Status */}
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>AI-powered chat</span>
              </span>
              {videoEnabled && <span>🎥 Video responses enabled</span>}
              {voiceEnabled && <span>🔊 Voice messages enabled</span>}
            </div>
            <div>
              {mentor.name === 'ZenKai' && (
                <span className="text-blue-600">✨ Enhanced ZenKai AI experience</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};