import React, { useState, useEffect } from 'react';
import { Video, MessageSquare, Play, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, Mentor } from '../../lib/supabase';
import { MentorCard } from '../mentors/MentorCard';
import { EnhancedChatInterface } from '../chat/EnhancedChatInterface';

export const MentorQuickStart: React.FC = () => {
  const { user } = useAuth();
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentors();
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

  const startChatWithMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowChat(true);
    setChatMinimized(false);
  };

  const closeChat = () => {
    setShowChat(false);
    setSelectedMentor(null);
    setChatMinimized(false);
  };

  const toggleMinimize = () => {
    setChatMinimized(!chatMinimized);
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
          <div className="text-right text-sm text-neutral-600">
            <div className="flex items-center space-x-1">
              <Video className="w-4 h-4" />
              <span>Real-time video responses</span>
            </div>
          </div>
        </div>

        <p className="font-body text-neutral-600 mb-6">
          Choose a mentor for instant live video conversation with AI-powered responses.
        </p>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableMentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => startChatWithMentor(mentor)}
              className={`p-4 border-2 border-border rounded-xl cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1 ${
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
                  mentor.name === 'ZenKai' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  <Play className="w-3 h-3" />
                  <span>Start Chat</span>
                </div>

                {/* Special Badge for ZenKai */}
                {mentor.name === 'ZenKai' && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    ✨ Enhanced AI
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-accent rounded-lg">
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-primary" />
              <div>
                <h5 className="font-body font-semibold text-primary-800">Live Video</h5>
                <p className="font-body text-xs text-primary-700">Real-time video responses</p>
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
      </div>

      {/* Enhanced Chat Interface */}
      {showChat && selectedMentor && (
        <EnhancedChatInterface
          mentor={selectedMentor}
          onClose={closeChat}
          onMinimize={toggleMinimize}
          minimized={chatMinimized}
        />
      )}
    </>
  );
};