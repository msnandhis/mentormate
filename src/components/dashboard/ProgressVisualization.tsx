import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Heart, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  });
  const [loading, setLoading] = useState(true);

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

    return {
      chartData,
      mentorData,
      stats: {
        moodTrend,
        completionTrend,
        consistencyScore,
        topMood,
        avgCompletion,
      },
    };
  };

  const formatDateForChart = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return { icon: TrendingUp, color: 'text-green-500', text: 'Improving' };
    if (trend < -5) return { icon: TrendingUp, color: 'text-red-500 rotate-180', text: 'Declining' };
    return { icon: Activity, color: 'text-blue-500', text: 'Stable' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-64 bg-neutral-100 rounded"></div>
        </div>
      </div>
    );
  }

  const moodTrendInfo = getTrendIcon(stats.moodTrend);
  const completionTrendInfo = getTrendIcon(stats.completionTrend);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="font-heading font-semibold text-xl text-foreground">
              Progress Analytics
            </h2>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | '3months')}
            className="font-body text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="3months">Past 3 Months</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <moodTrendInfo.icon className={`w-4 h-4 ${moodTrendInfo.color}`} />
            </div>
            <div className="font-heading font-bold text-xl text-blue-600">
              {stats.topMood > 0 ? `${stats.topMood}/10` : 'N/A'}
            </div>
            <div className="font-body text-sm text-blue-700">Best Mood</div>
            <div className="font-body text-xs text-blue-600 mt-1">
              {moodTrendInfo.text} {Math.abs(stats.moodTrend)}%
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <completionTrendInfo.icon className={`w-4 h-4 ${completionTrendInfo.color}`} />
            </div>
            <div className="font-heading font-bold text-xl text-green-600">
              {stats.avgCompletion}%
            </div>
            <div className="font-body text-sm text-green-700">Avg Completion</div>
            <div className="font-body text-xs text-green-600 mt-1">
              {completionTrendInfo.text} {Math.abs(stats.completionTrend)}%
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="font-heading font-bold text-xl text-purple-600">
              {stats.consistencyScore}%
            </div>
            <div className="font-body text-sm text-purple-700">Consistency</div>
            <div className="font-body text-xs text-purple-600 mt-1">
              Check-in frequency
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="font-heading font-bold text-xl text-orange-600">
              {chartData.filter(d => d.mood > 0).length}
            </div>
            <div className="font-body text-sm text-orange-700">Active Days</div>
            <div className="font-body text-xs text-orange-600 mt-1">
              Days with check-ins
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-border">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
            Mood Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#747578"
              />
              <YAxis 
                domain={[1, 10]}
                tick={{ fontSize: 12 }}
                stroke="#747578"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E4E4E7',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#2ABB63" 
                strokeWidth={3}
                dot={{ fill: '#2ABB63', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2ABB63' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Completion Chart */}
        <div className="bg-white rounded-xl p-6 border border-border">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
            Goal Completion Rate
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
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
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E4E4E7',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="completion_rate" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mentor Usage Distribution */}
        {mentorData.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-border">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Mentor Interaction Distribution
            </h3>
            <div className="flex items-center space-x-6">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={mentorData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mentorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {mentorData.map((mentor, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: mentor.color }}
                    />
                    <span className="font-body text-sm text-neutral-700">
                      {mentor.name}: {mentor.count} interactions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-white rounded-xl p-6 border border-border">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
            Key Insights
          </h3>
          <div className="space-y-3">
            {stats.moodTrend > 10 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-body text-green-800 text-sm">
                  🎉 Your mood has improved by {stats.moodTrend}% - keep up the great work!
                </p>
              </div>
            )}
            
            {stats.completionTrend > 15 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-body text-blue-800 text-sm">
                  📈 Goal completion is trending up {stats.completionTrend}% - you're building momentum!
                </p>
              </div>
            )}
            
            {stats.consistencyScore >= 80 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-body text-purple-800 text-sm">
                  ⭐ Excellent consistency at {stats.consistencyScore}% - you're developing strong habits!
                </p>
              </div>
            )}
            
            {stats.consistencyScore < 50 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-body text-orange-800 text-sm">
                  💡 Try setting reminders to improve consistency - even 2-3 check-ins per week makes a difference!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};