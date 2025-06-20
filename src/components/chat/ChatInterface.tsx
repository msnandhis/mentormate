import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Minimize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatSessions, chatMessages, mentors, ChatSession, ChatMessage, Mentor } from '../../lib/supabase';
import { VoiceRecorder } from './VoiceRecorder';
import { MentorAvatar } from './MentorAvatar';

interface ChatInterfaceProps {
  mentor?: Mentor;
  onClose?: () => void;
  onMinimize?: () => void;
  minimized?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
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
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [mentor, setMentor] = useState<Mentor | null>(initialMentor || null);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mentor && user) {
      initializeSession();
    }
  }, [mentor, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session) {
      const subscription = chatMessages.subscribeToSession(session.id, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        if (newMessage.sender_type === 'mentor') {
          setIsTyping(false);
          if (voiceEnabled && newMessage.voice_url) {
            playVoiceMessage(newMessage.voice_url);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session, voiceEnabled]);

  const initializeSession = async () => {
    if (!user?.id || !mentor) return;

    setLoading(true);
    try {
      const { data: newSession } = await chatSessions.create({
        user_id: user.id,
        mentor_id: mentor.id,
        session_type: voiceEnabled ? 'voice' : 'text',
      });

      if (newSession) {
        setSession(newSession);
        setIsConnected(true);
        
        // Load initial messages
        const { messages: sessionMessages } = await chatMessages.getBySession(newSession.id);
        setMessages(sessionMessages);

        // Send welcome message
        await sendSystemMessage('Chat session started. How can I help you today?');
      }
    } catch (error) {
      console.error('Error initializing chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'voice' = 'text', voiceUrl?: string) => {
    if (!session || !content.trim()) return;

    try {
      // Send user message
      await chatMessages.create({
        session_id: session.id,
        sender_type: 'user',
        message_type: messageType,
        content: content.trim(),
        voice_url: voiceUrl,
      });

      setNewMessage('');
      setIsTyping(true);

      // Simulate mentor response (in real implementation, this would call AI service)
      setTimeout(async () => {
        const mentorResponse = await generateMentorResponse(content);
        await chatMessages.create({
          session_id: session.id,
          sender_type: 'mentor',
          message_type: 'text',
          content: mentorResponse,
        });
      }, 1000 + Math.random() * 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const sendSystemMessage = async (content: string) => {
    if (!session) return;

    await chatMessages.create({
      session_id: session.id,
      sender_type: 'system',
      message_type: 'system',
      content,
    });
  };

  const generateMentorResponse = async (userMessage: string): Promise<string> => {
    if (!mentor) return "I'm here to help!";

    // In a real implementation, this would call your AI service
    // For now, we'll simulate mentor-specific responses
    const responses = {
      'Coach Lex': [
        "That's the spirit! Let's keep that momentum going! 💪",
        "I love hearing about your progress! What's your next challenge?",
        "You're building some serious momentum here! How does that feel?",
      ],
      'ZenKai': [
        "Thank you for sharing that with me. How are you feeling in this moment?",
        "I appreciate your honesty. What would serve you best right now?",
        "That sounds like an important realization. What does your intuition tell you?",
      ],
      'Prof. Ada': [
        "That's an interesting perspective. Let's break this down systematically.",
        "I can see you're thinking through this carefully. What patterns do you notice?",
        "Great insight! How might we apply this learning to your goals?",
      ],
      'No-BS Tony': [
        "Alright, let's cut to the chase. What action are you going to take?",
        "I hear you, but what are you actually going to do about it?",
        "Good. Now let's talk about making this happen. What's your timeline?",
      ],
    };

    const mentorResponses = responses[mentor.name as keyof typeof responses] || [
      "That's really interesting. Tell me more about that.",
      "I understand. How can I best support you with this?",
      "Thanks for sharing. What would be most helpful right now?",
    ];

    return mentorResponses[Math.floor(Math.random() * mentorResponses.length)];
  };

  const handleVoiceMessage = async (audioBlob: Blob, transcript: string) => {
    // In a real implementation, you'd upload the audio blob to storage
    // and get a URL back, then send it with the transcript
    await sendMessage(transcript, 'voice', 'mock-voice-url');
  };

  const playVoiceMessage = (voiceUrl: string) => {
    // In a real implementation, this would play the actual voice message
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
          className="w-16 h-16 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
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
            Choose a mentor to start your real-time conversation.
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${mentor.gradient || 'from-primary-500 to-primary-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MentorAvatar mentor={mentor} size="medium" />
              <div>
                <h2 className="font-heading font-bold text-lg">{mentor.name}</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  <span className="font-body text-sm opacity-90">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'user'
                        ? 'bg-primary text-white'
                        : message.sender_type === 'system'
                        ? 'bg-neutral-100 text-neutral-600 text-center text-sm'
                        : 'bg-neutral-100 text-foreground'
                    }`}
                  >
                    <p className="font-body">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_type === 'user' ? 'text-white/70' : 'text-neutral-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 text-foreground px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
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
        </div>
      </div>
    </div>
  );
};