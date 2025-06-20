import React, { useState, useEffect } from 'react';
import { Video, Plus, Clock, Users, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, Mentor } from '../../lib/supabase';
import { tavusConversations, conversationAnalytics, TavusConversation } from '../../lib/supabase-conversations';
import { tavusConversationsAPI } from '../../lib/tavus-conversations';
import { LiveConversationInterface } from './LiveConversationInterface';
import { MentorSelector } from '../mentors/MentorSelector';

export const ConversationManager: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<TavusConversation[]>([]);
  const [activeConversations, setActiveConversations] = useState<TavusConversation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showMentorSelector, setShowMentorSelector] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [conversationMinimized, setConversationMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConfigured, setApiConfigured] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = () => {
    setApiConfigured(tavusConversationsAPI.isConfigured());
  };

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [conversationsResult, activeResult, statsResult, mentorsResult] = await Promise.all([
        tavusConversations.getByUser(user.id, 10),
        tavusConversations.getActiveByUser(user.id),
        conversationAnalytics.getUserStats(user.id),
        mentors.getAll(),
      ]);

      setConversations(conversationsResult.conversations);
      setActiveConversations(activeResult.conversations);
      setStats(statsResult);
      
      // Filter mentors that support live conversations
      const liveConversationMentors = mentorsResult.mentors.filter(
        mentor => mentor.avatar_config?.replica_id && mentor.avatar_config?.persona_id
      );
      setAvailableMentors(liveConversationMentors);

    } catch (error) {
      console.error('Error loading conversation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    if (!apiConfigured) {
      alert('Please configure your Tavus API key in Settings → Integrations to use live conversations.');
      return;
    }
    setShowMentorSelector(true);
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowMentorSelector(false);
    setShowConversation(true);
    setConversationMinimized(false);
  };

  const closeConversation = () => {
    setShowConversation(false);
    setSelectedMentor(null);
    setConversationMinimized(false);
    loadData(); // Refresh data
  };

  const toggleMinimize = () => {
    setConversationMinimized(!conversationMinimized);
  };

  const resumeConversation = (conversation: TavusConversation) => {
    if (conversation.mentor) {
      setSelectedMentor(conversation.mentor);
      setShowConversation(true);
      setConversationMinimized(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-neutral-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header & Stats */}
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Video className="w-6 h-6 text-primary" />
              <h3 className="font-heading font-semibold text-xl text-foreground">
                Live Conversations
              </h3>
            </div>

            <button
              onClick={startNewConversation}
              disabled={!apiConfigured}
              className="flex items-center space-x-2 font-body px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* API Status Warning */}
          {!apiConfigured && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-body font-medium text-yellow-800">API Setup Required</h4>
                  <p className="font-body text-yellow-700 text-sm mt-1">
                    Configure your Tavus API key in Settings → Integrations to start live video conversations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="font-heading font-bold text-2xl text-primary">
                  {stats.totalConversations}
                </div>
                <div className="font-body text-sm text-primary-700">Total Conversations</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="font-heading font-bold text-2xl text-green-600">
                  {stats.activeConversations}
                </div>
                <div className="font-body text-sm text-green-700">Active Now</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="font-heading font-bold text-2xl text-blue-600">
                  {formatDuration(stats.totalDuration)}
                </div>
                <div className="font-body text-sm text-blue-700">Total Time</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="font-heading font-bold text-2xl text-purple-600">
                  {formatDuration(stats.avgDuration)}
                </div>
                <div className="font-body text-sm text-purple-700">Avg Duration</div>
              </div>
            </div>
          )}

          {/* Available Mentors */}
          <div>
            <h4 className="font-body font-medium text-foreground mb-3">
              Mentors Available for Live Chat ({availableMentors.length})
            </h4>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableMentors.map((mentor) => (
                <button
                  key={mentor.id}
                  onClick={() => apiConfigured && handleMentorSelect(mentor)}
                  disabled={!apiConfigured}
                  className={`p-3 border-2 border-border rounded-lg text-left hover:border-primary hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    mentor.name === 'ZenKai' ? 'bg-gradient-to-br from-blue-50 to-teal-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mentor.gradient} flex items-center justify-center`}>
                      <span className="font-bold text-white text-sm">
                        {mentor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-body font-semibold text-sm">{mentor.name}</div>
                      <div className="font-body text-xs text-neutral-600 capitalize">{mentor.category}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Conversations */}
        {activeConversations.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-border">
            <h4 className="font-body font-medium text-foreground mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Active Conversations</span>
            </h4>
            <div className="space-y-3">
              {activeConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${conversation.mentor?.gradient} flex items-center justify-center`}>
                        <span className="font-bold text-white">
                          {conversation.mentor?.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-body font-semibold text-green-800">
                          {conversation.mentor?.name}
                        </h5>
                        <p className="font-body text-sm text-green-600">
                          Started {formatDate(conversation.started_at || conversation.created_at)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => resumeConversation(conversation)}
                      className="flex items-center space-x-2 font-body px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        <div className="bg-white rounded-xl p-6 border border-border">
          <h4 className="font-body font-medium text-foreground mb-4">Recent Conversations</h4>
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h5 className="font-heading font-semibold text-foreground mb-2">
                No conversations yet
              </h5>
              <p className="font-body text-neutral-600 mb-4">
                Start your first live video conversation with an AI mentor.
              </p>
              <button
                onClick={startNewConversation}
                disabled={!apiConfigured}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start First Conversation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 bg-accent rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${conversation.mentor?.gradient} flex items-center justify-center`}>
                        <span className="font-bold text-white">
                          {conversation.mentor?.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-body font-semibold text-foreground">
                          {conversation.mentor?.name}
                        </h5>
                        <div className="flex items-center space-x-3 text-sm text-neutral-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(conversation.duration_seconds)}</span>
                          <span>•</span>
                          <span className="capitalize">{conversation.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-body text-sm text-neutral-600">
                        {formatDate(conversation.created_at)}
                      </div>
                      {conversation.status === 'active' ? (
                        <button
                          onClick={() => resumeConversation(conversation)}
                          className="font-body text-xs text-green-600 hover:text-green-800 transition-colors"
                        >
                          Resume →
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mentor Selector Modal */}
      {showMentorSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Start Live Conversation
              </h2>
              <p className="font-body text-neutral-600">
                Choose a mentor for your live video conversation.
              </p>
            </div>

            <MentorSelector
              onSelectMentor={handleMentorSelect}
              size="medium"
              title=""
              description=""
              showCustomMentors={false}
            />

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowMentorSelector(false)}
                className="font-body px-6 py-3 bg-neutral-200 text-foreground rounded-lg hover:bg-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Conversation Interface */}
      {showConversation && selectedMentor && (
        <LiveConversationInterface
          mentor={selectedMentor}
          onClose={closeConversation}
          onMinimize={toggleMinimize}
          minimized={conversationMinimized}
        />
      )}
    </>
  );
};