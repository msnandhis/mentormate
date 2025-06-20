import React, { useState, useEffect } from 'react';
import { MessageCircle, Video, Phone, Plus, Clock, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatSessions, mentors, ChatSession, Mentor } from '../../lib/supabase';
import { MentorSelector } from '../mentors/MentorSelector';
import { ChatInterface } from './ChatInterface';
import { MentorAvatar } from './MentorAvatar';

export const ChatSessionManager: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [showMentorSelector, setShowMentorSelector] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user?.id]);

  const loadSessions = async () => {
    if (!user?.id) return;

    try {
      const { sessions: userSessions } = await chatSessions.getByUser(user.id, 10);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const startNewChat = () => {
    setShowMentorSelector(true);
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowMentorSelector(false);
    setShowChat(true);
    setChatMinimized(false);
  };

  const resumeSession = (session: ChatSession) => {
    setActiveSession(session);
    setSelectedMentor(session.mentor || null);
    setShowChat(true);
    setChatMinimized(false);
  };

  const closeChat = () => {
    setShowChat(false);
    setActiveSession(null);
    setSelectedMentor(null);
    setChatMinimized(false);
    loadSessions(); // Refresh sessions
  };

  const toggleMinimize = () => {
    setChatMinimized(!chatMinimized);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
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

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h3 className="font-heading font-semibold text-xl text-foreground">
              Live Chat Sessions
            </h3>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center space-x-2 font-body px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Active Sessions */}
        {sessions.filter(s => s.status === 'active').length > 0 && (
          <div className="mb-6">
            <h4 className="font-body font-medium text-foreground mb-3">Active Sessions</h4>
            <div className="space-y-3">
              {sessions.filter(s => s.status === 'active').map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-primary-50 border border-primary-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => resumeSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MentorAvatar
                        mentor={session.mentor!}
                        size="medium"
                        showStatus
                        isActive={true}
                      />
                      <div>
                        <h5 className="font-body font-semibold text-primary-800">
                          {session.mentor?.name}
                        </h5>
                        <p className="font-body text-sm text-primary-600 capitalize">
                          {session.session_type} chat • Active
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-body text-sm text-primary-700">
                        Started {formatDate(session.started_at)}
                      </div>
                      <button className="font-body text-xs text-primary-600 hover:text-primary-800 transition-colors">
                        Resume →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div>
          <h4 className="font-body font-medium text-foreground mb-3">Recent Sessions</h4>
          {sessions.filter(s => s.status === 'ended').length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h5 className="font-heading font-semibold text-foreground mb-2">
                No chat sessions yet
              </h5>
              <p className="font-body text-neutral-600 mb-4">
                Start your first real-time conversation with an AI mentor.
              </p>
              <button
                onClick={startNewChat}
                className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start First Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.status === 'ended').map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-accent rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MentorAvatar mentor={session.mentor!} size="medium" />
                      <div>
                        <h5 className="font-body font-semibold text-foreground">
                          {session.mentor?.name}
                        </h5>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(session.duration_seconds)}</span>
                          <span>•</span>
                          <span className="capitalize">{session.session_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-body text-sm text-neutral-600">
                        {formatDate(session.started_at)}
                      </div>
                      <button
                        onClick={() => resumeSession(session)}
                        className="font-body text-xs text-primary hover:text-primary-600 transition-colors"
                      >
                        View Details
                      </button>
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
                Start Live Chat
              </h2>
              <p className="font-body text-neutral-600">
                Choose a mentor for your real-time conversation.
              </p>
            </div>

            <MentorSelector
              onSelectMentor={handleMentorSelect}
              size="medium"
              title=""
              description=""
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

      {/* Chat Interface */}
      {showChat && selectedMentor && (
        <ChatInterface
          mentor={selectedMentor}
          onClose={closeChat}
          onMinimize={toggleMinimize}
          minimized={chatMinimized}
        />
      )}
    </>
  );
};