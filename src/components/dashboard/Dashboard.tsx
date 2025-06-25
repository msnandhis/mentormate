import React, { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Video, Plus, Activity, Award, Clock, Users, MessageCircle, BarChart3, Lightbulb, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins } from '../../lib/supabase';
import { CheckinForm } from '../checkin/CheckinForm';
import { CheckinHistory } from './CheckinHistory';
import { MentorInsights } from '../mentors/MentorInsights';
import { ConversationManager } from '../conversation/ConversationManager';
import { MentorQuickStart } from './MentorQuickStart';
import { ProgressVisualization } from './ProgressVisualization';
import { GoalRecommendations } from './GoalRecommendations';
import { ProactiveNudges } from './ProactiveNudges';

export const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'live-chat' | 'history' | 'mentors'>('overview');
  const [stats, setStats] = useState({
    streak: 0,
    totalCheckins: 0,
    avgMood: 0,
    completionRate: 0,
    mentorUsage: {} as { [key: string]: number },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.id, showCheckinForm]);

  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      const [streakResult, weeklyStats] = await Promise.all([
        checkins.getStreak(user.id),
        checkins.getWeeklyStats(user.id),
      ]);
      
      setStats({
        streak: streakResult.streak,
        totalCheckins: weeklyStats.totalCheckins,
        avgMood: weeklyStats.avgMood,
        completionRate: weeklyStats.completionRate,
        mentorUsage: weeklyStats.mentorUsage,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckinComplete = () => {
    setShowCheckinForm(false);
    setActiveTab('overview');
    loadStats(); // Refresh stats after check-in
  };

  if (showCheckinForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => setShowCheckinForm(false)}
              className="font-body text-neutral-600 hover:text-foreground transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CheckinForm onComplete={handleCheckinComplete} />
        </div>
      </div>
    );
  };

  const topMentor = Object.entries(stats.mentorUsage).sort(([,a], [,b]) => b - a)[0];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Dashboard home'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Progress insights'
    },
    {
      id: 'live-chat',
      label: 'Live Chat',
      icon: Video,
      description: 'Video conversations'
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      description: 'Check-in history'
    },
    {
      id: 'mentors',
      label: 'Mentor Insights',
      icon: Users,
      description: 'Mentor analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Vertical Sidebar */}
        <div className="w-64 bg-white border-r border-border flex flex-col">
          {/* Welcome Section */}
          <div className="p-6 border-b border-border">
            <h1 className="font-heading font-bold text-xl text-foreground mb-1">
              Welcome back!
            </h1>
            <p className="font-body text-neutral-600 text-sm">
              {profile?.full_name || user?.email?.split('@')[0]}
            </p>
            {stats.streak > 0 && (
              <div className="flex items-center space-x-2 mt-3 p-3 bg-primary-50 rounded-lg">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-heading font-bold text-lg text-primary">{stats.streak}</div>
                  <div className="font-body text-xs text-primary-700">Day Streak 🔥</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-body transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-neutral-600 hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{tab.label}</div>
                      <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-neutral-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Quick Action */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => setShowCheckinForm(true)}
              className="w-full font-body px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Start Check-in</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Hero Section with Primary CTA */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <h1 className="font-heading font-bold text-3xl mb-4">
                      Ready for your daily check-in?
                    </h1>
                    <p className="font-body text-primary-100 text-lg mb-6">
                      {stats.streak > 0 
                        ? `Amazing! You're on a ${stats.streak}-day streak. Let's keep the momentum going with today's accountability session.`
                        : "Start building your accountability habit today. Your AI mentor is ready to support your journey."
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setShowCheckinForm(true)}
                        className="bg-white text-primary px-8 py-4 rounded-lg font-body font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Start Daily Check-in</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('live-chat')}
                        className="bg-primary-400 text-white px-6 py-4 rounded-lg font-body font-medium hover:bg-primary-300 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Quick Chat</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16" />
                  <div className="absolute bottom-0 right-8 w-24 h-24 bg-white/5 rounded-full" />
                </div>

                {/* Proactive Nudges */}
                <ProactiveNudges />

                {/* Stats Overview */}
                <div>
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
                    Your Progress Overview
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <div className="font-heading font-bold text-2xl text-primary">
                            {loading ? '...' : stats.streak}
                          </div>
                          <div className="font-body text-sm text-neutral-600">Day Streak</div>
                        </div>
                      </div>
                      <p className="font-body text-neutral-700 text-sm">
                        {stats.streak > 0 ? 'Keep it up! 🔥' : 'Start your first check-in'}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <div className="font-heading font-bold text-2xl text-blue-600">
                            {loading ? '...' : stats.totalCheckins}
                          </div>
                          <div className="font-body text-sm text-neutral-600">This Week</div>
                        </div>
                      </div>
                      <p className="font-body text-neutral-700 text-sm">Weekly check-ins</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-right">
                          <div className="font-heading font-bold text-2xl text-purple-600">
                            {loading ? '...' : stats.avgMood > 0 ? `${stats.avgMood}/10` : 'N/A'}
                          </div>
                          <div className="font-body text-sm text-neutral-600">Avg Mood</div>
                        </div>
                      </div>
                      <p className="font-body text-neutral-700 text-sm">Weekly average</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-success" />
                        </div>
                        <div className="text-right">
                          <div className="font-heading font-bold text-2xl text-success">
                            {loading ? '...' : stats.completionRate > 0 ? `${stats.completionRate}%` : 'N/A'}
                          </div>
                          <div className="font-body text-sm text-neutral-600">Goal Success</div>
                        </div>
                      </div>
                      <p className="font-body text-neutral-700 text-sm">Weekly completion rate</p>
                    </div>
                  </div>
                </div>

                {/* Live Video Chat Section */}
                <MentorQuickStart />

                {/* Top Mentor Section */}
                {topMentor && (
                  <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-6 h-6 text-primary" />
                      <h3 className="font-heading font-semibold text-xl text-foreground">
                        Your Go-To Mentor This Week
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <span className="font-heading font-bold text-white">
                          {topMentor[0].charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-body font-semibold text-foreground">
                          {topMentor[0]}
                        </div>
                        <div className="font-body text-neutral-600">
                          {topMentor[1]} interactions this week
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <ProgressVisualization />
                <GoalRecommendations />
              </div>
            )}

            {activeTab === 'live-chat' && <ConversationManager />}
            
            {activeTab === 'history' && <CheckinHistory />}
            
            {activeTab === 'mentors' && <MentorInsights />}
          </div>
        </div>
      </div>
    </div>
  );
};