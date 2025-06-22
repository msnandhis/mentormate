import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Settings, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatSessions, chatMessages, mentors, Mentor } from '../../lib/supabase';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'mentor' | 'system';
  created_at: string;
  metadata?: any;
}

interface EnhancedChatInterfaceProps {
  mentor: Mentor;
  onClose?: () => void;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  mentor,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user?.id) {
      initializeSession();
    }
  }, [user?.id, mentor.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initializeSession = async () => {
    if (!user?.id) return;

    try {
      // Create new chat session
      const { data: session, error } = await chatSessions.create({
        user_id: user.id,
        mentor_id: mentor.id,
        session_type: 'text'
      });

      if (error || !session) {
        console.error('Failed to create session:', error);
        return;
      }

      setSessionId(session.id);

      // Send welcome message
      const welcomeMessage = generateWelcomeMessage(mentor);
      await sendMentorMessage(session.id, welcomeMessage);

    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const generateWelcomeMessage = (mentor: Mentor): string => {
    const welcomeMessages = {
      'ZenKai': "Hello! I'm ZenKai, your wellness mentor. Take a deep breath and let's explore what's on your mind today. How can I support your journey toward balance and inner peace?",
      'Coach Lex': "Hey there! 💪 Coach Lex here, and I'm pumped to chat with you! Whether you want to talk about fitness, motivation, or crushing your goals, I'm here to help you become your strongest self. What's driving you today?",
      'Prof. Ada': "Greetings! I'm Professor Ada, your study and productivity mentor. I'm here to help you optimize your learning strategies and achieve your academic goals. What would you like to focus on in our conversation?",
      'No-BS Tony': "Alright, let's cut to the chase. I'm Tony, and I'm here to give you the straight talk you need to get results. No fluff, no excuses - just actionable advice. What do you need to work on?"
    };

    return welcomeMessages[mentor.name as keyof typeof welcomeMessages] || 
           `Hello! I'm ${mentor.name}, your ${mentor.category} mentor. I'm here to support you and help you achieve your goals. How can I assist you today?`;
  };

  const sendMentorMessage = async (sessionId: string, content: string) => {
    try {
      const { data, error } = await chatMessages.create({
        session_id: sessionId,
        sender_type: 'mentor',
        message_type: 'text',
        content,
        metadata: {
          mentor_name: mentor.name,
          ai_generated: false,
          welcome_message: true
        }
      });

      if (data) {
        setMessages(prev => [...prev, {
          id: data.id,
          content: data.content,
          sender_type: data.sender_type,
          created_at: data.created_at,
          metadata: data.metadata
        }]);
      }
    } catch (error) {
      console.error('Error sending mentor message:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !sessionId || !user?.id) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        content: userMessage,
        sender_type: 'user',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Save user message to database
      await chatMessages.create({
        session_id: sessionId,
        sender_type: 'user',
        message_type: 'text',
        content: userMessage
      });

      // Show typing indicator
      setIsTyping(true);

      // Generate AI response
      const aiResponse = await generateMentorResponse(userMessage);
      
      // Hide typing indicator
      setIsTyping(false);

      // Save and display AI response
      const { data: mentorMessage } = await chatMessages.create({
        session_id: sessionId,
        sender_type: 'mentor',
        message_type: 'text',
        content: aiResponse,
        metadata: {
          mentor_name: mentor.name,
          ai_generated: true,
          response_timestamp: new Date().toISOString()
        }
      });

      if (mentorMessage) {
        setMessages(prev => [...prev, {
          id: mentorMessage.id,
          content: mentorMessage.content,
          sender_type: mentorMessage.sender_type,
          created_at: mentorMessage.created_at,
          metadata: mentorMessage.metadata
        }]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm having trouble responding right now. Please try again in a moment.",
        sender_type: 'mentor',
        created_at: new Date().toISOString(),
        metadata: { error: true }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMentorResponse = async (userMessage: string): Promise<string> => {
    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        sender_type: msg.sender_type,
        content: msg.content
      }));

      const response = await fetch(`/functions/v1/ai-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          mentor: {
            id: mentor.id,
            name: mentor.name,
            category: mentor.category,
            personality: mentor.personality,
            speaking_style: mentor.speaking_style,
            motivation_approach: mentor.motivation_approach,
            prompt_template: mentor.prompt_template,
            response_style: mentor.response_style
          },
          user_message: userMessage,
          context: {
            conversation_history: conversationHistory
          },
          session_type: 'chat'
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const result = await response.json();
      return result.response || generateFallbackResponse(mentor);

    } catch (error) {
      console.error('AI response error:', error);
      return generateFallbackResponse(mentor);
    }
  };

  const generateFallbackResponse = (mentor: Mentor): string => {
    const fallbackResponses = {
      'ZenKai': "I hear you, and I appreciate you sharing that with me. Take a moment to breathe deeply. Whatever you're experiencing right now is valid, and we can work through it together. What feels most important to address first?",
      'Coach Lex': "I hear you loud and clear! 💪 Whatever challenge you're facing, remember that every champion has faced setbacks. The key is how we respond and bounce back stronger. What's one small action you can take right now to move forward?",
      'Prof. Ada': "Thank you for sharing that insight. Let's approach this systematically. Based on what you've told me, I can see several angles we could explore. What aspect would you like to dive deeper into first?",
      'No-BS Tony': "Alright, I hear what you're saying. Here's the deal - we can talk about the problem all day, but what matters is what you're going to DO about it. What's the next concrete step you're willing to take?"
    };

    return fallbackResponses[mentor.name as keyof typeof fallbackResponses] || 
           "I understand what you're saying. Let me think about that and provide you with some helpful guidance. How can I best support you right now?";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [currentMessage]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${mentor.gradient || 'from-primary-500 to-primary-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-heading font-bold text-white">
                {mentor.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-heading font-semibold">{mentor.name}</h3>
              <p className="text-sm opacity-90 capitalize">{mentor.category} mentor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs">AI-Powered</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              message.sender_type === 'user' 
                ? 'bg-primary text-white rounded-2xl rounded-br-md' 
                : 'bg-accent text-foreground rounded-2xl rounded-bl-md'
            } px-4 py-2`}>
              <p className="font-body text-sm whitespace-pre-wrap">{message.content}</p>
              <div className={`text-xs mt-1 ${
                message.sender_type === 'user' ? 'text-primary-100' : 'text-neutral-500'
              }`}>
                {formatTime(message.created_at)}
                {message.metadata?.ai_generated && (
                  <span className="ml-2 inline-flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <TypingIndicator mentorName={mentor.name} visible={isTyping} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${mentor.name}...`}
              className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none min-h-[44px] max-h-[120px]"
              disabled={isLoading}
              rows={1}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="p-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isLoading && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>AI thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};