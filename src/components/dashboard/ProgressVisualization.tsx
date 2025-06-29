import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Heart, Activity, Loader2, Lightbulb, Info, ArrowRight, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { checkins } from '../../lib/supabase';

interface ChartData {
  date: string;
  mood: number;
  goals_completed: number;
  goals_total: number;
  completion_rate: number;
}

interface MentorUsageData {
  name: string;
  count: number;
  color: string;
}

export const ProgressVisualization: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | '3months'>('month');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [mentorData, setMentorData] = useState<MentorUsageData[]>([]);
  const [stats, setStats] = useState({
    moodTrend: 0,
    completionTrend: 0,
    consistencyScore: 0,
    topMood: 0,
    avgCompletion: 0,
    longestStreak: 0,
    currentStreak: 0,
    totalCheckins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProgressData();
    }
  }, [user?.id, timeframe]);

  const loadProgressData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get check-ins for the specified timeframe
      const { checkins: userCheckins } = await checkins.getAll(user.id, 200);
      const filteredCheckins = userCheckins.filter(
        checkin => new Date(checkin.created_at) >= startDate
      );

      // Process data for charts
      const processedData = processCheckinData(filteredCheckins, days);
      setChartData(processedData.chartData);
      setMentorData(processedData.mentorData);
      setStats(processedData.stats);

      // Show tips for new users
      setShowTip(userCheckins.length < 5);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCheckinData = (checkins: any[], days: number) => {
    // Create date range
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });

    // Group check-ins by date
    const checkinsByDate = checkins.reduce((acc, checkin) => {
      const date = checkin.created_at.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(checkin);
      return acc;
    }, {} as { [key: string]: any[] });

    // Process chart data
    const chartData: ChartData[] = dateRange.map(date => {
      const dayCheckins = checkinsByDate[date] || [];
      
      if (dayCheckins.length === 0) {
        return {
          date: formatDateForChart(date),
          mood: 0,
          goals_completed: 0,
          goals_total: 0,
          completion_rate: 0,
        };
      }

      // Use the latest check-in for the day
      const latestCheckin = dayCheckins[dayCheckins.length - 1];
      const goalStatus = latestCheckin.goal_status || [];
      const completedGoals = goalStatus.filter((g: any) => g.completed).length;
      const totalGoals = goalStatus.length;
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

      return {
        date: formatDateForChart(date),
        mood: latestCheckin.mood_score,
        goals_completed: completedGoals,
        goals_total: totalGoals,
        completion_rate: completionRate,
      };
    });

    // Process mentor usage data
    const mentorUsage: { [key: string]: number } = {};
    checkins.forEach(checkin => {
      const mentorName = checkin.mentor?.name || 'Unknown';
      mentorUsage[mentorName] = (mentorUsage[mentorName] || 0) + 1;
    });

    const mentorColors = ['#2ABB63', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
    const mentorData: MentorUsageData[] = Object.entries(mentorUsage)
      .map(([name, count], index) => ({
        name,
        count,
        color: mentorColors[index % mentorColors.length],
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate statistics
    const validMoods = chartData.filter(d => d.mood > 0).map(d => d.mood);
    const validCompletions = chartData.filter(d => d.goals_total > 0).map(d => d.completion_rate);
    
    const moodTrend = calculateTrend(validMoods);
    const completionTrend = calculateTrend(validCompletions);
    const consistencyScore = Math.round((checkins.length / days) * 100);
    const topMood = Math.max(...validMoods, 0);
    const avgCompletion = validCompletions.length > 0 
      ? Math.round(validCompletions.reduce((sum, rate) => sum + rate, 0) / validCompletions.length)
      : 0;

    // Calculate streaks
    const streaks = calculateStreaks(checkins);

    return {
      chartData,
      mentorData,
      stats: {
        moodTrend,
        completionTrend,
        consistencyScore,
        topMood,
        avgCompletion,
        longestStreak: streaks.longest,
        currentStreak: streaks.current,
        totalCheckins: checkins.length
      },
    };
  };

  const calculateStreaks = (checkins: any[]) => {
    const sortedCheckins = [...checkins].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate: Date | null = null;

    // Function to check if dates are consecutive days
    const isConsecutiveDay = (date1: Date, date2: Date) => {
      const dayDiff = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff === 1;
    };

    // Calculate streaks
    for (const checkin of sortedCheckins) {
      const checkinDate = new Date(checkin.created_at);
      checkinDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        // First checkin
        currentStreak = 1;
        longestStreak = 1;
      } else if (isConsecutiveDay(lastDate, checkinDate)) {
        // Consecutive day
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (lastDate.getTime() === checkinDate.getTime()) {
        // Same day, do nothing
      } else {
        // Streak broken
        currentStreak = 1;
      }

      lastDate = checkinDate;
    }

    // Check if current streak is still active
    if (lastDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last check-in wasn't today or yesterday, streak is broken
      if (lastDate.getTime() !== today.getTime() && lastDate.getTime() !== yesterday.getTime()) {
        currentStreak = 0;
      }
    }

    return { longest: longestStreak, current: currentStreak };
  };

  const formatDateForChart = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    if (firstAvg === 0) return 0;
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return { icon: TrendingUp, color: 'text-success', bg: 'bg-success-50', text: 'Improving' };
    if (trend < -5) return { icon: TrendingUp, color: 'text-red-500 rotate-180', bg: 'bg-red-50', text: 'Declining' };
    return { icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', text: 'Stable' };
  };

  const renderNoDataMessage = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <BarChart3 className="w-16 h-16 text-neutral-300 mb-4" />
      <h3 className="font-heading font-semibold text-xl text-neutral-700 mb-2">
        No data to display yet
      </h3>
      <p className="font-body text-neutral-600 text-center max-w-md mb-6">
        Complete a few more check-ins to see your progress analytics.
        The more consistently you check in, the more insights you'll discover!
      </p>
      <button className="px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors flex items-center space-x-2">
        <Calendar className="w-4 h-4" />
        <span>Start a Check-in</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-border shadow-md">
        <div className="flex items-center justify-center space-x-3 h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="font-body text-neutral-600">Loading your analytics...</span>
        </div>
      </div>
    );
  }

  // Check if there's enough data to display
  const hasData = chartData.some(d => d.mood > 0);
  const moodTrendInfo = getTrendIcon(stats.moodTrend);
  const completionTrendInfo = getTrendIcon(stats.completionTrend);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 border border-border shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-foreground">
                Your Progress Analytics
              </h2>
              <p className="font-body text-neutral-600">
                Track your journey and identify patterns to improve
              </p>
            </div>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | '3months')}
            className="font-body text-sm border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Mood Trend */}
          <div className={`${moodTrendInfo.bg} rounded-xl p-4 border border-${moodTrendInfo.color.replace('text-', '')}-100 shadow-sm`}>
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-primary" />
              <div className="font-body text-sm text-neutral-700">Mood Trend</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="font-heading font-bold text-2xl text-foreground">
                {stats.moodTrend > 0 ? `+${stats.moodTrend}%` : `${stats.moodTrend}%`}
              </div>
              <moodTrendInfo.icon className={`w-5 h-5 ${moodTrendInfo.color}`} />
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              {moodTrendInfo.text}
            </div>
          </div>
          
          {/* Goal Completion */}
          <div className={`${completionTrendInfo.bg} rounded-xl p-4 border border-${completionTrendInfo.color.replace('text-', '')}-100 shadow-sm`}>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <div className="font-body text-sm text-neutral-700">Goal Completion</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="font-heading font-bold text-2xl text-foreground">
                {stats.avgCompletion}%
              </div>
              <completionTrendInfo.icon className={`w-5 h-5 ${completionTrendInfo.color}`} />
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              Average completion rate
            </div>
          </div>
          
          {/* Current Streak */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div className="font-body text-sm text-neutral-700">Current Streak</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="font-heading font-bold text-2xl text-foreground">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
              </div>
              {stats.currentStreak > 0 && (
                <span className="text-lg">🔥</span>
              )}
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              {stats.longestStreak > stats.currentStreak 
                ? `Best: ${stats.longestStreak} days` 
                : 'Personal best!'}
            </div>
          </div>
          
          {/* Consistency Score */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="font-body text-sm text-neutral-700">Consistency</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="font-heading font-bold text-2xl text-foreground">
                {stats.consistencyScore}%
              </div>
              {stats.consistencyScore >= 80 && (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
              {stats.consistencyScore < 50 && stats.consistencyScore > 0 && (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              Check-in frequency
            </div>
          </div>
        </div>
        
        {/* Tips for new users */}
        {showTip && (
          <div className="mt-6 p-5 bg-primary-50 rounded-xl border border-primary-100">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-heading font-semibold text-primary-800 mb-1">
                  Getting Started with Analytics
                </h4>
                <p className="font-body text-primary-700 text-sm mb-3">
                  Your analytics will become more insightful as you complete more check-ins.
                  Try to check in regularly to discover patterns in your mood and goal progress.
                </p>
                <button className="flex items-center space-x-2 font-body text-sm text-primary font-medium hover:text-primary-600 transition-colors">
                  <span>Complete your first check-in</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      {hasData ? (
        <>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mood Trend Chart */}
            <div className="bg-white rounded-xl p-8 border border-border shadow-md">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-primary" />
                <span>Mood Trend</span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData.filter(d => d.mood > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#747578"
                  />
                  <YAxis 
                    domain={[0, 10]}
                    tick={{ fontSize: 12 }}
                    stroke="#747578"
                    tickCount={6}
                    label={{ value: 'Mood (1-10)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#747578', fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E4E4E7',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}/10`, 'Mood']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#2ABB63" 
                    strokeWidth={3}
                    dot={{ fill: '#2ABB63', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#2ABB63' }}
                    name="Mood"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {chartData.filter(d => d.mood > 0).length < 2 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-body text-sm text-blue-700">
                    Complete more check-ins to see your mood trend develop over time.
                  </p>
                </div>
              )}
            </div>

            {/* Goal Completion Chart */}
            <div className="bg-white rounded-xl p-8 border border-border shadow-md">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Goal Completion</span>
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.filter(d => d.goals_total > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#747578"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="#747578"
                    tickCount={6}
                    label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#747578', fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E4E4E7',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="completion_rate" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    name="Completion Rate"
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {chartData.filter(d => d.goals_total > 0).length < 2 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-body text-sm text-blue-700">
                    Track more goals to see your completion rates develop over time.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mentor Usage Distribution */}
            {mentorData.length > 0 && (
              <div className="bg-white rounded-xl p-8 border border-border shadow-md">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Mentor Distribution</span>
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between h-64">
                  <div className="w-full md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mentorData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {mentorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E4E4E7',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => [`${value} check-ins`, 'Count']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0">
                    {mentorData.map((mentor, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: mentor.color }}
                        />
                        <div>
                          <div className="font-body font-medium text-foreground">
                            {mentor.name}
                          </div>
                          <div className="font-body text-sm text-neutral-600">
                            {mentor.count} check-in{mentor.count !== 1 ? 's' : ''}
                            <span className="text-xs text-neutral-500 ml-1">
                              ({Math.round((mentor.count / stats.totalCheckins) * 100)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Insights Panel */}
            <div className="bg-white rounded-xl p-8 border border-border shadow-md">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span>Personalized Insights</span>
              </h3>
              
              {hasData ? (
                <div className="space-y-4">
                  {stats.moodTrend > 10 && (
                    <div className="p-4 bg-success-50 border border-success-100 rounded-xl flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-body font-semibold text-success-800 mb-1">
                          Mood Improvement
                        </h4>
                        <p className="font-body text-success-700 text-sm">
                          Your mood has improved by {stats.moodTrend}% - whatever you're doing is working! Keep it up.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.completionTrend > 15 && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-body font-semibold text-blue-800 mb-1">
                          Goal Momentum
                        </h4>
                        <p className="font-body text-blue-700 text-sm">
                          Goal completion is trending up {stats.completionTrend}% - you're building excellent momentum!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.consistencyScore >= 80 && (
                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-body font-semibold text-purple-800 mb-1">
                          Exceptional Consistency
                        </h4>
                        <p className="font-body text-purple-700 text-sm">
                          At {stats.consistencyScore}% consistency, you're developing strong habits! Consistency is the key to lasting change.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.consistencyScore < 40 && stats.consistencyScore > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start space-x-3">
                      <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-body font-semibold text-orange-800 mb-1">
                          Consistency Opportunity
                        </h4>
                        <p className="font-body text-orange-700 text-sm">
                          Try scheduling regular check-ins to improve your consistency. Even 3-4 check-ins per week can make a significant difference in your progress!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.currentStreak >= 5 && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
                      <Activity className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-body font-semibold text-amber-800 mb-1">
                          Impressive Streak!
                        </h4>
                        <p className="font-body text-amber-700 text-sm">
                          You're on a {stats.currentStreak}-day streak! Keep going to reinforce your daily habits.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show fewer than 3 insights */}
                  {[
                    stats.moodTrend > 10,
                    stats.completionTrend > 15,
                    stats.consistencyScore >= 80,
                    stats.consistencyScore < 40 && stats.consistencyScore > 0,
                    stats.currentStreak >= 5
                  ].filter(Boolean).length < 3 && (
                    <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <h4 className="font-body font-semibold text-neutral-700 mb-1">
                          Building Your Analytics
                        </h4>
                        <p className="font-body text-neutral-600 text-sm">
                          Continue checking in regularly to generate more personalized insights about your habits and progress patterns.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="w-12 h-12 text-neutral-300 mb-3" />
                  <p className="font-body text-neutral-600 text-center">
                    Complete more check-ins to see personalized insights.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600 transition-colors shadow-sm">
                    Start Check-in
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        renderNoDataMessage()
      )}
    </div>
  );
};