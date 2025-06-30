import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Target, MessageSquare, Heart, Loader2, Info, Filter, Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins, Checkin, mentors as mentorService, Mentor } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface MentorInsight {
  mentorId: string;
  mentorName: string;
  category: string;
  totalCheckins: number;
  avgMood: number;
  goalCompletionRate: number;
  lastUsed: string;
  gradient?: string;
  strengths: string[];
  feedback: string;
}

interface GoalInsight {
  goalText: string;
  successRate: number;
  frequency: number;
  mentorId: string;
  mentorName: string;
}

export const MentorInsights: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MentorInsight[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [goalInsights, setGoalInsights] = useState<GoalInsight[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (user?.id) {
      loadMentorInsights();
    }
  }, [user?.id, timeframe, selectedMentorId]);

  const loadMentorInsights = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { checkins: userCheckins } = await checkins.getAll(user.id, 100);
      const { mentors: allMentors } = await mentorService.getAll();
      
      setMentors(allMentors);
      
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

      // Further filter by mentor if selected
      const mentorFilteredCheckins = selectedMentorId === 'all' 
        ? filteredCheckins 
        : filteredCheckins.filter(checkin => checkin.mentor_id === selectedMentorId);

      // Group checkins by mentor
      const mentorStats: { [key: string]: Checkin[] } = {};
      mentorFilteredCheckins.forEach(checkin => {
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
        
        // Track individual goal success
        const goalStats: {[goalText: string]: {attempts: number, successes: number}} = {};
        
        checkins.forEach(checkin => {
          const goals = checkin.goal_status || [];
          totalGoals += goals.length;
          
          goals.forEach(g => {
            if (!goalStats[g.goal_text]) {
              goalStats[g.goal_text] = {attempts: 0, successes: 0};
            }
            goalStats[g.goal_text].attempts += 1;
            
            if (g.completed) {
              completedGoals += 1;
              goalStats[g.goal_text].successes += 1;
            }
          });
        });

        const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        const lastUsed = checkins[checkins.length - 1]?.created_at || '';
        
        // Identify areas where this mentor helps most (highest success rates)
        const strengths = Object.entries(goalStats)
          .filter(([_, stats]) => stats.attempts >= 2)
          .sort((a, b) => (b[1].successes / b[1].attempts) - (a[1].successes / a[1].attempts))
          .slice(0, 2)
          .map(([goalText]) => goalText);
        
        // Generate personalized feedback based on insights
        let feedback = '';
        if (avgMood >= 7 && goalCompletionRate >= 70) {
          feedback = `${mentor.name} has been highly effective for you, with excellent mood scores and goal completion rates.`;
        } else if (avgMood >= 7) {
          feedback = `${mentor.name} positively impacts your mood, but goal completion could be improved.`;
        } else if (goalCompletionRate >= 70) {
          feedback = `${mentor.name} helps you complete goals effectively, but may not maximize your mood and wellbeing.`;
        } else {
          feedback = `${mentor.name} may not be your optimal match. Consider trying other mentors for comparison.`;
        }

        return {
          mentorId,
          mentorName: mentor.name,
          category: mentor.category,
          totalCheckins,
          avgMood,
          goalCompletionRate,
          lastUsed,
          gradient: mentor.gradient,
          strengths,
          feedback
        };
      }).filter(Boolean) as MentorInsight[];

      // Process goal insights across all mentors
      const allGoalStats: {[goalText: string]: {attempts: number, successes: number, mentorId: string, mentorName: string}} = {};
      
      mentorFilteredCheckins.forEach(checkin => {
        const goals = checkin.goal_status || [];
        const mentorId = checkin.mentor_id;
        const mentorName = allMentors.find(m => m.id === mentorId)?.name || 'Unknown';
        
        goals.forEach(g => {
          if (!allGoalStats[g.goal_text]) {
            allGoalStats[g.goal_text] = {attempts: 0, successes: 0, mentorId, mentorName};
          }
          allGoalStats[g.goal_text].attempts += 1;
          
          if (g.completed) {
            allGoalStats[g.goal_text].successes += 1;
          }
          
          // Update mentor if this one seems more effective for this goal
          const currentSuccess = allGoalStats[g.goal_text].successes / allGoalStats[g.goal_text].attempts;
          if (g.completed && checkins.length > 1) {
            allGoalStats[g.goal_text].mentorId = mentorId;
            allGoalStats[g.goal_text].mentorName = mentorName;
          }
        });
      });
      
      // Convert to array and filter for goals with enough data
      const goalInsightsArray = Object.entries(allGoalStats)
        .filter(([_, stats]) => stats.attempts >= 2)
        .map(([goalText, stats]) => ({
          goalText,
          successRate: Math.round((stats.successes / stats.attempts) * 100),
          frequency: stats.attempts,
          mentorId: stats.mentorId,
          mentorName: stats.mentorName
        }))
        .sort((a, b) => b.frequency - a.frequency);

      // Sort by total check-ins
      mentorInsights.sort((a, b) => b.totalCheckins - a.totalCheckins);
      setInsights(mentorInsights);
      setGoalInsights(goalInsightsArray);
    } catch (error) {
      console.error('Error loading mentor insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-success bg-success-50 border-success-100';
    if (mood >= 6) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (mood >= 4) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-success bg-success-50 border-success-100';
    if (rate >= 60) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (rate >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // Today or yesterday
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    // Within a week
    const diffDays = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // Longer
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCompletionBarColor = (rate: number) => {
    if (rate >= 80) return '#2ABB63'; // success
    if (rate >= 60) return '#3B82F6'; // blue
    if (rate >= 40) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-border shadow-md">
        <div className="flex items-center justify-center space-x-3 h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="font-body text-neutral-600">Loading mentor insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl p-6 md:p-8 border border-border shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                Mentor Performance Analytics
              </h2>
              <p className="font-body text-neutral-600 text-sm md:text-base">
                See which mentors work best for different goals
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Mentor Filter */}
            <div className="relative flex items-center space-x-2">
              <Users className="w-4 h-4 text-neutral-500" />
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="font-body text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
              >
                <option value="all">All Mentors</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                ))}
              </select>
            </div>
            
            {/* Timeframe Filter */}
            <div className="relative flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
                className="font-body text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl">
            <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl text-neutral-800 mb-2">
              No mentor interactions yet
            </h3>
            <p className="font-body text-neutral-600 mb-6 max-w-md mx-auto">
              Complete your first check-in to start seeing how different mentors help you achieve your goals.
            </p>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md">
              Start First Check-in
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mentor Performance Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <div
                  key={`${insight.mentorName}-${index}`}
                  className="p-4 md:p-6 bg-white rounded-xl border border-border hover:shadow-xl transition-all duration-300"
                >
                  {/* Mentor Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${insight.gradient || 'from-primary-500 to-primary-600'} rounded-xl flex items-center justify-center shadow-md`}>
                      <span className="font-heading font-bold text-white text-lg md:text-xl">
                        {insight.mentorName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-lg md:text-xl text-foreground">
                        {insight.mentorName}
                      </h4>
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                        <span className="font-body text-sm text-neutral-600 capitalize">
                          {insight.category} mentor
                        </span>
                        <div className="hidden md:flex md:items-center md:space-x-1 text-xs text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          <span>Last: {formatDate(insight.lastUsed)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mb-5">
                    {/* Check-ins */}
                    <div className="bg-neutral-50 rounded-lg p-2 md:p-3 border border-neutral-100">
                      <div className="flex items-center space-x-1 mb-1 text-neutral-700">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-body text-xs">Check-ins</span>
                      </div>
                      <div className="font-heading font-bold text-lg md:text-xl text-foreground">
                        {insight.totalCheckins}
                      </div>
                    </div>

                    {/* Average Mood */}
                    <div className={`rounded-lg p-2 md:p-3 border ${getMoodColor(insight.avgMood)}`}>
                      <div className="flex items-center space-x-1 mb-1">
                        <Heart className="w-4 h-4" />
                        <span className="font-body text-xs">Avg Mood</span>
                      </div>
                      <div className="font-heading font-bold text-lg md:text-xl">
                        {insight.avgMood}/10
                      </div>
                    </div>

                    {/* Goal Completion */}
                    <div className={`rounded-lg p-2 md:p-3 border ${getCompletionColor(insight.goalCompletionRate)}`}>
                      <div className="flex items-center space-x-1 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="font-body text-xs">Completion</span>
                      </div>
                      <div className="font-heading font-bold text-lg md:text-xl">
                        {insight.goalCompletionRate}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Strengths */}
                  {insight.strengths.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-body font-medium text-sm text-neutral-700 mb-2">
                        Most Successful Goals with {insight.mentorName}:
                      </h5>
                      <div className="space-y-2">
                        {insight.strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-success rounded-full"></div>
                            <span className="font-body text-sm text-neutral-600">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback */}
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="font-body text-sm text-primary-700">
                      {insight.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Goal Performance Analysis */}
            {goalInsights.length > 0 && (
              <div className="p-4 md:p-6 bg-white rounded-xl border border-border">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4 md:mb-6">
                  Goal Performance Analysis
                </h3>
                
                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0">
                  {/* Bar Chart */}
                  <div className="md:w-2/3">
                    <h4 className="font-body font-medium text-neutral-700 mb-4">
                      Goal Success Rates:
                    </h4>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={goalInsights.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <YAxis 
                            dataKey="goalText" 
                            type="category" 
                            width={150} 
                            tick={{fontSize: 12}}
                            tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Success Rate']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E4E4E7',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="successRate" name="Success Rate">
                            {goalInsights.slice(0, 5).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCompletionBarColor(entry.successRate)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Goal Analysis */}
                  <div className="md:w-1/3 md:pl-6 md:border-l border-border">
                    <h4 className="font-body font-medium text-neutral-700 mb-4">
                      Mentor-Goal Matches:
                    </h4>
                    <div className="space-y-4">
                      {goalInsights.slice(0, 3).map((goal, index) => (
                        <div key={index} className="p-4 bg-accent rounded-lg border border-border">
                          <div className="font-body font-medium text-foreground mb-1">
                            "{goal.goalText}"
                          </div>
                          <div className={`text-sm ${getCompletionColor(goal.successRate).split(' ')[0]}`}>
                            {goal.successRate}% success rate
                          </div>
                          <div className="flex items-center space-x-1 mt-2 text-xs text-neutral-600">
                            <Users className="w-3 h-3" />
                            <span>Best with: {goal.mentorName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Insights Summary */}
            <div className="p-4 md:p-6 bg-gradient-to-r from-primary-50 to-accent rounded-xl border border-primary-100">
              <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary-800 mb-2">
                    Your Mentor Journey
                  </h3>
                  <p className="font-body text-primary-700">
                    You've worked with {insights.length} different mentor{insights.length > 1 ? 's' : ''} 
                    {timeframe === 'week' ? ' this week' : timeframe === 'month' ? ' this month' : ' so far'}. 
                    {insights[0] && (
                      <> Your most used mentor is <strong>{insights[0].mentorName}</strong> with {insights[0].totalCheckins} check-ins.</>
                    )}
                    {insights.length > 1 && insights[0] && insights[1] && insights[0].avgMood < insights[1].avgMood && (
                      <> However, <strong>{insights[1].mentorName}</strong> appears to have the most positive impact on your mood.</>
                    )}
                  </p>
                  
                  {goalInsights.length > 0 && goalInsights[0].successRate >= 70 && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg">
                      <p className="font-body text-sm text-primary-700">
                        <strong>Tip:</strong> Your most successful goal is "{goalInsights[0].goalText}" with a {goalInsights[0].successRate}% completion rate. 
                        Consider using {goalInsights[0].mentorName} for accountability with similar goals!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};