import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Target, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins, Checkin, mentors as mentorService } from '../../lib/supabase';

interface MentorInsight {
  mentorName: string;
  category: string;
  totalCheckins: number;
  avgMood: number;
  goalCompletionRate: number;
  lastUsed: string;
  gradient?: string;
}

export const MentorInsights: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MentorInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (user?.id) {
      loadMentorInsights();
    }
  }, [user?.id, timeframe]);

  const loadMentorInsights = async () => {
    if (!user?.id) return;

    try {
      const { checkins: userCheckins } = await checkins.getAll(user.id, 100);
      const { mentors: allMentors } = await mentorService.getAll();
      
      // Filter checkins by timeframe
      const cutoffDate = new Date();
      if (timeframe === 'week') {
        cutoffDate.setDate(cutoffDate.getDate() - 7);
      } else if (timeframe === 'month') {
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      } else {
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 10); // All time
      }

      const filteredCheckins = userCheckins.filter(
        checkin => new Date(checkin.created_at) >= cutoffDate
      );

      // Group checkins by mentor
      const mentorStats: { [key: string]: Checkin[] } = {};
      filteredCheckins.forEach(checkin => {
        const mentorId = checkin.mentor_id;
        if (!mentorStats[mentorId]) {
          mentorStats[mentorId] = [];
        }
        mentorStats[mentorId].push(checkin);
      });

      // Calculate insights for each mentor
      const mentorInsights: MentorInsight[] = Object.entries(mentorStats).map(([mentorId, checkins]) => {
        const mentor = allMentors.find(m => m.id === mentorId);
        if (!mentor) return null;

        const totalCheckins = checkins.length;
        const avgMood = Math.round(
          checkins.reduce((sum, c) => sum + c.mood_score, 0) / totalCheckins
        );

        // Calculate goal completion rate
        let totalGoals = 0;
        let completedGoals = 0;
        checkins.forEach(checkin => {
          const goals = checkin.goal_status || [];
          totalGoals += goals.length;
          completedGoals += goals.filter(g => g.completed).length;
        });

        const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        const lastUsed = checkins[checkins.length - 1]?.created_at || '';

        return {
          mentorName: mentor.name,
          category: mentor.category,
          totalCheckins,
          avgMood,
          goalCompletionRate,
          lastUsed,
          gradient: mentor.gradient,
        };
      }).filter(Boolean) as MentorInsight[];

      // Sort by total check-ins
      mentorInsights.sort((a, b) => b.totalCheckins - a.totalCheckins);
      setInsights(mentorInsights);
    } catch (error) {
      console.error('Error loading mentor insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600 bg-green-50';
    if (mood >= 6) return 'text-blue-600 bg-blue-50';
    if (mood >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-blue-600 bg-blue-50';
    if (rate >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h3 className="font-heading font-semibold text-xl text-foreground">
            Mentor Insights
          </h3>
        </div>
        
        {/* Timeframe Filter */}
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
          className="font-body text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="font-body text-neutral-600">
            No mentor interactions yet. Complete your first check-in to see insights!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={`${insight.mentorName}-${index}`}
              className="p-4 bg-accent rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mentor Avatar */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${insight.gradient || 'from-primary-500 to-primary-600'} rounded-lg flex items-center justify-center`}>
                    <span className="font-heading font-bold text-white text-lg">
                      {insight.mentorName.charAt(0)}
                    </span>
                  </div>

                  {/* Mentor Info */}
                  <div>
                    <h4 className="font-heading font-semibold text-foreground">
                      {insight.mentorName}
                    </h4>
                    <p className="font-body text-sm text-neutral-600 capitalize">
                      {insight.category} mentor
                    </p>
                  </div>
                </div>

                {/* Last Used */}
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-neutral-500">
                    <Calendar className="w-4 h-4" />
                    <span className="font-body text-sm">
                      {formatDate(insight.lastUsed)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {/* Check-ins */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <MessageSquare className="w-4 h-4 text-neutral-500" />
                    <span className="font-body text-xs text-neutral-500">Check-ins</span>
                  </div>
                  <div className="font-heading font-bold text-lg text-foreground">
                    {insight.totalCheckins}
                  </div>
                </div>

                {/* Average Mood */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-neutral-500" />
                    <span className="font-body text-xs text-neutral-500">Avg Mood</span>
                  </div>
                  <div className={`font-heading font-bold text-lg px-2 py-1 rounded-full ${getMoodColor(insight.avgMood)}`}>
                    {insight.avgMood}/10
                  </div>
                </div>

                {/* Goal Completion */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Target className="w-4 h-4 text-neutral-500" />
                    <span className="font-body text-xs text-neutral-500">Goals</span>
                  </div>
                  <div className={`font-heading font-bold text-lg px-2 py-1 rounded-full ${getCompletionColor(insight.goalCompletionRate)}`}>
                    {insight.goalCompletionRate}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {insights.length > 0 && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h4 className="font-heading font-semibold text-primary-800 mb-2">
            Your Mentor Journey
          </h4>
          <p className="font-body text-primary-700 text-sm">
            You've worked with {insights.length} different mentor{insights.length > 1 ? 's' : ''} 
            {timeframe === 'week' ? ' this week' : timeframe === 'month' ? ' this month' : ' so far'}. 
            {insights[0] && (
              <> Your most used mentor is {insights[0].mentorName} with {insights[0].totalCheckins} check-ins.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};