import React, { useState, useEffect } from 'react';
import { Video, MessageSquare, Play, Users, Sparkles, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, Mentor } from '../../lib/supabase';
import { tavusAPI } from '../../lib/tavus';
import { LiveVideoInterface } from '../video/LiveVideoInterface';

export const MentorQuickStart: React.FC = () => {
  const { user } = useAuth();
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showVideoInterface, setShowVideoInterface] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiQuota, setApiQuota] = useState<any>(null);

  useEffect(() => {
    loadMentors();
    checkApiStatus();
  }, []);

  const loadMentors = async () => {
    try {
      const { mentors: mentorList } = await mentors.getAll();
      setAvailableMentors(mentorList.filter(m => !m.is_custom));
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApiStatus = async () => {
    try {
      const health = await tavusAPI.checkHealth();
      if (health.status === 'mock') {
        setApiStatus('error');
      } else {
        setApiStatus('connected');
        // Get quota info
        try {
          const quota = await tavusAPI.getQuota();
          setApiQuota(quota);
        } catch (quotaError) {
          console.warn('Could not fetch quota:', quotaError);
        }
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  const startVideoChat = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowVideoInterface(true);
  };

  const closeVideoInterface = () => {
    setShowVideoInterface(false);
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
        return `Tavus API Connected${apiQuota ? ` • ${apiQuota.videos_remaining} videos remaining` : ''}`;
      case 'error':
        return 'API Configuration Required';
      default:
        return 'Checking API Status...';
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
            <Users className="w-6 h-6 text-primary" />
            <h3 className="font-heading font-semibold text-xl text-foreground">
              Start Live Video Chat
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
                  To use live video chat, please configure your Tavus API key in Settings → Integrations.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="font-body text-neutral-600 mb-6">
          Choose a mentor for instant live video conversation with AI-powered responses.
          {apiStatus === 'connected' && apiQuota && (
            <span className="text-green-600 ml-1">
              ✅ Ready for video generation
            </span>
          )}
        </p>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableMentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => apiStatus === 'connected' && startVideoChat(mentor)}
              className={`p-4 border-2 border-border rounded-xl transition-all duration-300 ${
                apiStatus === 'connected' 
                  ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' 
                  : 'opacity-50 cursor-not-allowed'
              } ${
                mentor.name === 'ZenKai' ? 'bg-gradient-to-br from-blue-50 to-teal-50' : 'bg-white'
              }`}
            >
              {/* Mentor Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                {mentor.name === 'ZenKai' ? (
                  <Sparkles className="w-6 h-6 text-white" />
                ) : (
                  <span className="font-heading font-bold text-white text-lg">
                    {mentor.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Mentor Info */}
              <div className="text-center">
                <h4 className="font-heading font-bold text-foreground mb-1">
                  {mentor.name}
                </h4>
                <p className={`font-body text-xs capitalize mb-2 ${
                  mentor.name === 'ZenKai' ? 'text-blue-600' : 'text-neutral-600'
                }`}>
                  {mentor.category}
                </p>

                {/* Quick Action */}
                <div className={`flex items-center justify-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                  apiStatus === 'connected' ? (
                    mentor.name === 'ZenKai' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-primary-100 text-primary-700'
                  ) : 'bg-gray-100 text-gray-500'
                }`}>
                  <Play className="w-3 h-3" />
                  <span>{apiStatus === 'connected' ? 'Start Chat' : 'Setup Required'}</span>
                </div>

                {/* Special Badge for ZenKai */}
                {mentor.name === 'ZenKai' && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✨ Enhanced AI
                  </div>
                )}

                {/* Video Support Indicator */}
                {apiStatus === 'connected' && mentor.avatar_config && (
                  <div className="mt-1 text-xs text-green-600">
                    🎥 Video Ready
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${apiStatus === 'connected' ? 'bg-gradient-to-r from-primary-50 to-accent' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <Video className={`w-5 h-5 ${apiStatus === 'connected' ? 'text-primary' : 'text-gray-400'}`} />
              <div>
                <h5 className={`font-body font-semibold ${apiStatus === 'connected' ? 'text-primary-800' : 'text-gray-600'}`}>
                  Live Video
                </h5>
                <p className={`font-body text-xs ${apiStatus === 'connected' ? 'text-primary-700' : 'text-gray-500'}`}>
                  {apiStatus === 'connected' ? 'Real-time video responses' : 'Requires API setup'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <h5 className="font-body font-semibold text-blue-800">Instant Responses</h5>
                <p className="font-body text-xs text-blue-700">AI-powered conversations</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h5 className="font-body font-semibold text-purple-800">Personalized</h5>
                <p className="font-body text-xs text-purple-700">Tailored to your goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Status Summary */}
        {apiStatus === 'connected' && apiQuota && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-body font-medium text-green-800">Ready for Live Video</span>
              </div>
              <div className="text-sm text-green-700">
                {apiQuota.videos_remaining} videos • {apiQuota.voice_minutes_remaining} voice minutes remaining
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Video Interface */}
      {showVideoInterface && selectedMentor && (
        <LiveVideoInterface
          mentor={selectedMentor}
          onClose={closeVideoInterface}
        />
      )}
    </>
  );
};