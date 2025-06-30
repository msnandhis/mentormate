import React, { useState, useEffect } from 'react';
import { Video, MessageSquare, Play, Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';
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
          {apiStatus === 'connected' && (
            <span className="text-green-600 ml-1">
              ✅ Ready for live conversations
            </span>
          )}
        </p>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableMentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => apiStatus === 'connected' && startLiveConversation(mentor)}
              className={`p-4 border-2 border-border rounded-xl transition-all duration-300 ${
                apiStatus === 'connected' 
                  ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' 
                  : 'opacity-50 cursor-not-allowed'
              } ${
                mentor.name === 'ZenKai' ? 'bg-gradient-to-br from-blue-50 to-teal-50' : 
                mentor.name === 'Coach Lex' ? 'bg-gradient-to-br from-red-50 to-orange-50' :
                mentor.name === 'Prof. Sophia' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
                mentor.name === 'Dr. Maya' ? 'bg-gradient-to-br from-gray-50 to-gray-100' :
                'bg-white'
              }`}
            >
              {/* Mentor Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                <span className="font-heading font-bold text-white text-lg">
                  {mentor.name.charAt(0)}
                </span>
              </div>

              {/* Mentor Info */}
              <div className="text-center">
                <h4 className="font-heading font-bold text-foreground mb-1">
                  {mentor.name}
                </h4>
                <p className={`font-body text-xs capitalize mb-2 ${
                  mentor.name === 'ZenKai' ? 'text-blue-600' : 
                  mentor.name === 'Coach Lex' ? 'text-red-600' :
                  mentor.name === 'Prof. Sophia' ? 'text-purple-600' :
                  mentor.name === 'Dr. Maya' ? 'text-gray-600' :
                  'text-neutral-600'
                }`}>
                  {mentor.category}
                </p>

                {/* Live Chat Button */}
                <div className={`flex items-center justify-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                  apiStatus === 'connected' ? (
                    mentor.name === 'ZenKai' ? 'bg-blue-100 text-blue-700' : 
                    mentor.name === 'Coach Lex' ? 'bg-red-100 text-red-700' :
                    mentor.name === 'Prof. Sophia' ? 'bg-purple-100 text-purple-700' :
                    mentor.name === 'Dr. Maya' ? 'bg-gray-100 text-gray-700' :
                    'bg-primary-100 text-primary-700'
                  ) : 'bg-gray-100 text-gray-500'
                }`}>
                  <Play className="w-3 h-3" />
                  <span>{apiStatus === 'connected' ? 'Start Live Chat' : 'Setup Required'}</span>
                </div>

                {/* Live Support Indicator */}
                {apiStatus === 'connected' && mentor.avatar_config?.replica_id && (
                  <div className="mt-1 text-xs text-green-600">
                    🎥 Live Ready
                  </div>
                )}
              </div>
            </div>
          ))}

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

        {/* API Status Summary */}
        {apiStatus === 'connected' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-body font-medium text-green-800">Live Conversations Ready</span>
              </div>
              <div className="text-sm text-green-700">
                Tavus API configured • {availableMentors.length} mentors available
              </div>
            </div>
          </div>
        )}
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