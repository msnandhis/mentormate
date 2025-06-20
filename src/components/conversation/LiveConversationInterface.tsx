import React, { useState, useEffect, useRef } from 'react';
import { Video, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Users, Clock, Minimize2, Maximize2, Settings, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Mentor } from '../../lib/supabase';
import { tavusConversations, conversationEvents, TavusConversation } from '../../lib/supabase-conversations';
import { tavusConversationsAPI, createMentorConversation } from '../../lib/tavus-conversations';

interface LiveConversationInterfaceProps {
  mentor: Mentor;
  onClose?: () => void;
  onMinimize?: () => void;
  minimized?: boolean;
}

interface ConversationState {
  status: 'initializing' | 'connecting' | 'active' | 'ended' | 'error';
  message?: string;
  duration: number;
}

export const LiveConversationInterface: React.FC<LiveConversationInterfaceProps> = ({
  mentor,
  onClose,
  onMinimize,
  minimized = false,
}) => {
  const { user, profile } = useAuth();
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    status: 'initializing',
    duration: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && mentor && !conversation) {
      initializeConversation();
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [user, mentor]);

  useEffect(() => {
    if (conversationState.status === 'active' && !durationIntervalRef.current) {
      durationIntervalRef.current = setInterval(() => {
        setConversationState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } else if (conversationState.status !== 'active' && durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, [conversationState.status]);

  const initializeConversation = async () => {
    if (!user?.id || !mentor) return;

    setConversationState({ status: 'initializing', duration: 0 });
    setError(null);

    try {
      // Check if API is configured
      if (!tavusConversationsAPI.isConfigured()) {
        throw new Error('Tavus API not configured. Please add your API key in Settings → Integrations.');
      }

      // Check if mentor supports live conversations
      if (!mentor.avatar_config?.replica_id || !mentor.avatar_config?.persona_id) {
        throw new Error(`${mentor.name} is not configured for live conversations yet. Please try regular video responses instead.`);
      }

      // Create conversation record in database
      const { data: conversationRecord, error: dbError } = await tavusConversations.create({
        user_id: user.id,
        mentor_id: mentor.id,
        conversation_name: `Live Chat with ${mentor.name}`,
        conversational_context: `Live conversation with ${mentor.name}, a ${mentor.category} mentor.`,
        custom_greeting: generateCustomGreeting(mentor, profile?.full_name),
        properties: {
          max_call_duration: 3600,
          enable_closed_captions: true,
          language: 'english',
        },
      });

      if (dbError || !conversationRecord) {
        throw new Error('Failed to create conversation record');
      }

      setConversation(conversationRecord);
      setConversationState({ status: 'connecting', duration: 0 });

      // Create Tavus conversation
      const tavusConversation = await createMentorConversation(
        mentor,
        profile?.full_name,
        'This is a live video conversation session.'
      );

      // Update conversation with Tavus data
      const { data: updatedConversation } = await tavusConversations.updateWithTavusData(
        conversationRecord.id,
        {
          tavus_conversation_id: tavusConversation.conversation_id,
          conversation_url: tavusConversation.conversation_url,
          status: 'active',
          started_at: new Date().toISOString(),
        }
      );

      if (updatedConversation) {
        setConversation(updatedConversation);
        setConversationState({ status: 'active', duration: 0 });

        // Log conversation start event
        await conversationEvents.create({
          conversation_id: updatedConversation.id,
          event_type: 'created',
          event_data: {
            tavus_conversation_id: tavusConversation.conversation_id,
            mentor_name: mentor.name,
          },
        });
      }

    } catch (error) {
      console.error('Error initializing conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setError(errorMessage);
      setConversationState({ 
        status: 'error', 
        message: errorMessage,
        duration: 0 
      });
    }
  };

  const endConversation = async () => {
    if (!conversation) return;

    try {
      // End conversation in Tavus
      if (conversation.tavus_conversation_id) {
        await tavusConversationsAPI.endConversation(conversation.tavus_conversation_id);
      }

      // Update conversation in database
      await tavusConversations.end(conversation.id);

      // Calculate final duration
      await tavusConversations.calculateDuration(conversation.id);

      // Log end event
      await conversationEvents.create({
        conversation_id: conversation.id,
        event_type: 'ended',
        event_data: {
          duration_seconds: conversationState.duration,
        },
      });

      setConversationState({ status: 'ended', duration: conversationState.duration });

    } catch (error) {
      console.error('Error ending conversation:', error);
    }

    onClose?.();
  };

  const generateCustomGreeting = (mentor: Mentor, userName?: string): string => {
    const name = userName || 'there';
    
    const greetings = {
      'ZenKai': `Hello ${name}, welcome to our peaceful space. I'm ZenKai, here to guide you mindfully through our conversation today.`,
      'Coach Lex': `Hey ${name}! Coach Lex here, ready to energize our chat and help you crush your goals! 💪`,
      'Prof. Ada': `Greetings ${name}! I'm Professor Ada, excited to have an intellectually stimulating conversation with you today.`,
      'No-BS Tony': `${name}, let's get straight to business. I'm Tony, and I'm here to give you the real talk you need.`,
    };

    return greetings[mentor.name as keyof typeof greetings] || 
           `Hello ${name}! I'm ${mentor.name}, looking forward to our conversation today.`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (conversationState.status) {
      case 'initializing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'connecting':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ended':
        return <Phone className="w-5 h-5 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Video className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (conversationState.status) {
      case 'initializing':
        return 'Initializing conversation...';
      case 'connecting':
        return 'Connecting to mentor...';
      case 'active':
        return `Live with ${mentor.name}`;
      case 'ended':
        return 'Conversation ended';
      case 'error':
        return 'Connection failed';
      default:
        return 'Ready';
    }
  };

  // Minimized view
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onMinimize}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
            conversationState.status === 'active' 
              ? `bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'} animate-pulse`
              : 'bg-gray-500'
          }`}
        >
          <div className="relative">
            {getStatusIcon()}
            {conversationState.status === 'active' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
        </button>
        {conversationState.status === 'active' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
            {formatDuration(conversationState.duration)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${mentor.gradient || 'from-primary-500 to-primary-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">{mentor.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl">
                Live Conversation with {mentor.name}
              </h2>
              <div className="flex items-center space-x-3 text-sm opacity-90">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
                {conversationState.status === 'active' && (
                  <>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(conversationState.duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={endConversation}
              className="p-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
        {conversationState.status === 'error' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white max-w-md">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold mb-4">Connection Failed</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={initializeConversation}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {conversationState.status === 'initializing' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">Setting Up Your Conversation</h3>
              <p className="text-gray-300">Preparing to connect you with {mentor.name}...</p>
            </div>
          </div>
        )}

        {conversationState.status === 'connecting' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${mentor.gradient} flex items-center justify-center animate-pulse`}>
                <span className="text-2xl font-bold">{mentor.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connecting to {mentor.name}</h3>
              <p className="text-gray-300">Your mentor will join the conversation shortly...</p>
            </div>
          </div>
        )}

        {conversationState.status === 'active' && conversation?.conversation_url && (
          <div className="flex-1">
            <iframe
              ref={iframeRef}
              src={conversation.conversation_url}
              className="w-full h-full"
              allow="camera; microphone; fullscreen; speaker; display-capture"
              title={`Live conversation with ${mentor.name}`}
            />
          </div>
        )}

        {conversationState.status === 'ended' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-semibold mb-4">Conversation Ended</h3>
              <p className="text-gray-300 mb-2">
                Duration: {formatDuration(conversationState.duration)}
              </p>
              <p className="text-gray-300 mb-6">
                Thank you for chatting with {mentor.name}!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {conversationState.status === 'active' && (
        <div className="p-4 bg-black/50 text-white text-center text-sm">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live conversation active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Connected to {mentor.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(conversationState.duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};