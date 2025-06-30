import React, { useState, useEffect } from 'react';
import { Video, Play, Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, Mentor } from '../../lib/supabase';
import { tavusConversationsAPI } from '../../lib/tavus-conversations';
import { LiveConversationInterface } from '../conversation/LiveConversationInterface';

export const MentorQuickStart: React.FC = () => {
  const { user } = useAuth();
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showConversationInterface, setShowConversationInterface] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    loadMentors();
    checkApiStatus();
  }, []);

  const loadMentors = async () => {
    try {
      const { mentors: mentorList } = await mentors.getAll();
      // Filter mentors that support live conversations
      const liveConversationMentors = mentorList.filter(
        m => !m.is_custom && m.avatar_config?.replica_id && m.avatar_config?.persona_id
      );
      setAvailableMentors(liveConversationMentors);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApiStatus = async () => {
    try {
      if (!tavusConversationsAPI.isConfigured()) {
        setApiStatus('error');
        return;
      }
      
      // For production, you'd check the actual API health here
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('error');
    }
  };

  const startLiveConversation = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowConversationInterface(true);
  };

  const closeConversationInterface = () => {
    setShowConversationInterface(false);
    setSelectedMentor(null);
  };

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return 'Live Conversations Ready';
      case 'error':
        return 'API Setup Required';
      default:
        return 'Checking Status...';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-neutral-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-primary" />
            <h3 className="font-heading font-semibold text-xl text-foreground">
              Live Video Conversations
            </h3>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center space-x-2 text-neutral-600">
              {getApiStatusIcon()}
              <span>{getApiStatusText()}</span>
            </div>
          </div>
        </div>

        {/* API Status Warning */}
        {apiStatus === 'error' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-body font-medium text-yellow-800">API Setup Required</h4>
                <p className="font-body text-yellow-700 text-sm mt-1">
                  Configure your Tavus API key in Settings → Integrations to enable live conversations.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="font-body text-neutral-600 mb-6">
          Start live video conversations with AI mentors using Tavus's conversational video interface.
        </p>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            key="coach-lex"
            onClick={() => apiStatus === 'connected' && startLiveConversation(availableMentors.find(m => m.name === "Coach Lex") || availableMentors[0])}
            className={`p-4 border-2 border-border rounded-xl transition-all duration-300 ${
              apiStatus === 'connected' 
                ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Mentor Image */}
            <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg">
              <img 
                src="/Coach%20Lex.png" 
                alt="Coach Lex"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Mentor Info */}
            <div className="text-center">
              <h4 className="font-heading font-bold text-foreground mb-1">
                Coach Lex
              </h4>
              <p className="font-body text-xs capitalize mb-2 text-neutral-600">
                fitness
              </p>

              {/* Live Chat Button */}
              <div className={`flex items-center justify-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                apiStatus === 'connected' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <Play className="w-3 h-3" />
                <span>Start Live Chat</span>
              </div>
            </div>
          </div>

          <div
            key="zenkai"
            onClick={() => apiStatus === 'connected' && startLiveConversation(availableMentors.find(m => m.name === "ZenKai") || availableMentors[0])}
            className={`p-4 border-2 border-border rounded-xl transition-all duration-300 ${
              apiStatus === 'connected' 
                ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Mentor Image */}
            <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg">
              <img 
                src="/ZenKai.png" 
                alt="ZenKai"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Mentor Info */}
            <div className="text-center">
              <h4 className="font-heading font-bold text-foreground mb-1">
                ZenKai
              </h4>
              <p className="font-body text-xs capitalize mb-2 text-neutral-600">
                wellness
              </p>

              {/* Live Chat Button */}
              <div className={`flex items-center justify-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                apiStatus === 'connected' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <Play className="w-3 h-3" />
                <span>Start Live Chat</span>
              </div>
            </div>
          </div>

          <div
            key="prof-sophia"
            onClick={() => apiStatus === 'connected' && startLiveConversation(availableMentors.find(m => m.name === "Prof. Sophia") || availableMentors[0])}
            className={`p-4 border-2 border-border rounded-xl transition-all duration-300 ${
              apiStatus === 'connected' 
                ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Mentor Image */}
            <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg">
              <img 
                src="/Prof%20Sophia.png" 
                alt="Prof. Sophia"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Mentor Info */}
            <div className="text-center">
              <h4 className="font-heading font-bold text-foreground mb-1">
                Prof. Sophia
              </h4>
              <p className="font-body text-xs capitalize mb-2 text-neutral-600">
                study
              </p>

              {/* Live Chat Button */}
              <div className={`flex items-center justify-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                apiStatus === 'connected' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <Play className="w-3 h-3" />
                <span>Start Live Chat</span>
              </div>
            </div>
          </div>

          <div
            key="dr-maya"
            onClick={() => apiStatus === 'connected' && startLiveConversation(availableMentors.find(m => m.name === "Dr. Maya") || availableMentors[0])}
            className={`p-4 border-2 border-border rounded-xl transition-all duration-300 ${
              apiStatus === 'connected' 
                ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Mentor Image */}
            <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg">
              <img 
                src="/Dr%20Maya.png" 
                alt="Dr. Maya"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Mentor Info */}
            <div className="text-center">
              <h4 className="font-heading font-bold text-foreground mb-1">
                Dr. Maya
              </h4>
              <p className="font-body text-xs capitalize mb-2 text-neutral-600">
                career
              </p>

              {/* Live Chat Button */}
              <div className={`flex items-center justify-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                apiStatus === 'connected' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <Play className="w-3 h-3" />
                <span>Start Live Chat</span>
              </div>
            </div>
          </div>

          {availableMentors.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Video className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h4 className="font-heading font-semibold text-foreground mb-2">
                No Live Mentors Available
              </h4>
              <p className="font-body text-neutral-600">
                Mentors are being configured for live conversations. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${apiStatus === 'connected' ? 'bg-gradient-to-r from-primary-50 to-accent' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <Video className={`w-5 h-5 ${apiStatus === 'connected' ? 'text-primary' : 'text-gray-400'}`} />
              <div>
                <h5 className={`font-body font-semibold ${apiStatus === 'connected' ? 'text-primary-800' : 'text-gray-600'}`}>
                  Live Video Chat
                </h5>
                <p className={`font-body text-xs ${apiStatus === 'connected' ? 'text-primary-700' : 'text-gray-500'}`}>
                  {apiStatus === 'connected' ? 'Real-time conversations' : 'Requires API setup'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <h5 className="font-body font-semibold text-blue-800">Instant Responses</h5>
                <p className="font-body text-xs text-blue-700">AI-powered interactions</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <h5 className="font-body font-semibold text-purple-800">Multiple Mentors</h5>
                <p className="font-body text-xs text-purple-700">Choose your style</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Conversation Interface */}
      {showConversationInterface && selectedMentor && (
        <LiveConversationInterface
          mentor={selectedMentor}
          onClose={closeConversationInterface}
        />
      )}
    </>
  );
};