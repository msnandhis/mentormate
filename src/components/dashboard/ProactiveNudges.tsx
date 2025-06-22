import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, TrendingUp, Calendar, X, Star, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatMessages, chatSessions } from '../../lib/supabase';

interface ProactiveNudge {
  id: string;
  content: string;
  type: 'nudge' | 'celebration' | 'suggestion';
  pattern_type: 'missed_checkins' | 'low_mood' | 'goal_struggle' | 'celebration';
  mentor_name: string;
  mentor_gradient?: string;
  created_at: string;
  ai_generated: boolean;
  metadata: any;
}

export const ProactiveNudges: React.FC = () => {
  const { user } = useAuth();
  const [nudges, setNudges] = useState<ProactiveNudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      loadProactiveNudges();
    }
  }, [user?.id]);

  const loadProactiveNudges = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get recent chat sessions for the user
      const { sessions } = await chatSessions.getByUser(user.id, 10);
      
      const recentNudges: ProactiveNudge[] = [];
      
      // Look for proactive messages in recent sessions
      for (const session of sessions) {
        const { messages } = await chatMessages.getBySession(session.id);
        
        const proactiveMessages = messages.filter(
          msg => msg.sender_type === 'mentor' && 
          msg.metadata?.proactive === true &&
          msg.created_at >= new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
        );
        
        proactiveMessages.forEach(msg => {
          recentNudges.push({
            id: msg.id,
            content: msg.content,
            type: msg.metadata.message_category || 'nudge',
            pattern_type: msg.metadata.pattern_type || 'general',
            mentor_name: session.mentor?.name || 'Your Mentor',
            mentor_gradient: session.mentor?.gradient,
            created_at: msg.created_at,
            ai_generated: msg.metadata.ai_generated || false,
            metadata: msg.metadata,
          });
        });
      }

      // Sort by most recent first
      recentNudges.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setNudges(recentNudges.slice(0, 3)); // Show only top 3 recent nudges
    } catch (error) {
      console.error('Error loading proactive nudges:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNudge = (nudgeId: string) => {
    setDismissedNudges(prev => new Set(prev).add(nudgeId));
  };

  const getPatternIcon = (patternType: string) => {
    switch (patternType) {
      case 'missed_checkins':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'low_mood':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'goal_struggle':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'celebration':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-primary" />;
    }
  };

  const getPatternStyle = (patternType: string) => {
    switch (patternType) {
      case 'missed_checkins':
        return 'bg-orange-50 border-orange-200';
      case 'low_mood':
        return 'bg-red-50 border-red-200';
      case 'goal_struggle':
        return 'bg-blue-50 border-blue-200';
      case 'celebration':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-primary-50 border-primary-200';
    }
  };

  const getPatternTitle = (patternType: string) => {
    switch (patternType) {
      case 'missed_checkins':
        return 'Check-in Reminder';
      case 'low_mood':
        return 'Mood Support';
      case 'goal_struggle':
        return 'Goal Guidance';
      case 'celebration':
        return 'Celebration';
      default:
        return 'Mentor Message';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter out dismissed nudges
  const visibleNudges = nudges.filter(nudge => !dismissedNudges.has(nudge.id));

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-16 bg-neutral-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (visibleNudges.length === 0) {
    return null; // Don't show the component if there are no nudges
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">
            Proactive Insights
          </h2>
          <p className="font-body text-neutral-600">
            Your AI mentors noticed these patterns and wanted to reach out
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {visibleNudges.map((nudge) => (
          <div
            key={nudge.id}
            className={`p-4 rounded-lg border-2 ${getPatternStyle(nudge.pattern_type)} relative`}
          >
            {/* Dismiss Button */}
            <button
              onClick={() => dismissNudge(nudge.id)}
              className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-4 pr-8">
              {/* Mentor Avatar */}
              <div className={`w-12 h-12 bg-gradient-to-br ${nudge.mentor_gradient || 'from-primary-500 to-primary-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="font-heading font-bold text-white text-sm">
                  {nudge.mentor_name.charAt(0)}
                </span>
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-2">
                  {getPatternIcon(nudge.pattern_type)}
                  <h3 className="font-body font-semibold text-foreground">
                    {getPatternTitle(nudge.pattern_type)}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    from {nudge.mentor_name}
                  </span>
                  {nudge.ai_generated && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                      AI-Generated
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="font-body text-neutral-700 leading-relaxed mb-3">
                  {nudge.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{formatTimeAgo(nudge.created_at)}</span>
                  
                  {nudge.type === 'celebration' && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Star className="w-3 h-3" />
                      <span>Celebration</span>
                    </div>
                  )}
                  
                  {nudge.pattern_type === 'missed_checkins' && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Gentle Reminder</span>
                    </div>
                  )}
                  
                  {nudge.pattern_type === 'low_mood' && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <Heart className="w-3 h-3" />
                      <span>Mood Support</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pattern Data Display (for debugging/transparency) */}
            {nudge.metadata?.pattern_data && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                <div className="text-xs text-neutral-600">
                  {nudge.pattern_type === 'missed_checkins' && (
                    <span>Haven't checked in for {nudge.metadata.pattern_data.days_missed} days</span>
                  )}
                  {nudge.pattern_type === 'low_mood' && (
                    <span>Average mood: {nudge.metadata.pattern_data.avg_mood}/10 recently</span>
                  )}
                  {nudge.pattern_type === 'goal_struggle' && (
                    <span>Goal completion: {nudge.metadata.pattern_data.completion_rate}%</span>
                  )}
                  {nudge.pattern_type === 'celebration' && (
                    <span>Average mood: {nudge.metadata.pattern_data.avg_mood}/10 - Keep it up!</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-body font-semibold text-primary-800 mb-1">
              Personalized AI Support
            </h4>
            <p className="font-body text-primary-700 text-sm">
              Your mentors analyze your patterns automatically and reach out with timely, 
              personalized guidance. This proactive support helps you stay on track even 
              when life gets busy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};