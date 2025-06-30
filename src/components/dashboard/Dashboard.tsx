import React, { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Video, Plus, Activity, Award, Clock, Users, MessageCircle, BarChart3, Lightbulb, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins } from '../../lib/supabase';
import { CheckinForm } from '../checkin/CheckinForm';
import { CheckinHistory } from './CheckinHistory';
import { MentorInsights } from '../mentors/MentorInsights';
import { ConversationManager } from '../conversation/ConversationManager';
import { MentorQuickStart } from './MentorQuickStart';
import { ProgressVisualization } from './ProgressVisualization';
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
      {/* Mobile Quick Action - Always visible at top for mobile */}
      <div className="lg:hidden fixed top-16 left-0 right-0 bg-white z-10 p-4 border-b border-border shadow-sm">
        <button
          onClick={() => setShowCheckinForm(true)}
          className="w-full font-body px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Start Check-in</span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Vertical Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-64 bg-white border-r border-border flex-col h-screen sticky top-16">
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
          <nav className="flex-1 p-4 overflow-y-auto">
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
        <div className="flex-1 overflow-auto pt-20 lg:pt-0">
          {/* Mobile Navigation Tabs */}
          <div className="lg:hidden overflow-x-auto whitespace-nowrap p-2 bg-white border-b border-border">
            <div className="inline-flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg font-body transition-colors mx-1 ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-accent text-neutral-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-xs font-medium">{tab.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Simplified Hero Section */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
                  <div className="relative z-10 max-w-3xl">
                    <h1 className="font-heading font-bold text-2xl md:text-3xl mb-2 md:mb-3">
                      Ready for your daily check-in?
                    </h1>
                    <p className="font-body text-primary-100 text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
                      {stats.streak > 0 
                        ? `You're on a ${stats.streak}-day streak! Let's keep the momentum going.`
                        : "Start building your accountability habit today. Your AI mentor is ready to support your journey."
                      }
                    </p>
                    <button
                      onClick={() => setShowCheckinForm(true)}
                      className="bg-white text-primary px-6 py-3 rounded-lg font-body font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Start Daily Check-in</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Simplified background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16" />
                  <div className="absolute bottom-0 right-8 w-24 h-24 bg-white/5 rounded-full" />
                </div>

                {/* Proactive Nudges */}
                <ProactiveNudges />

                {/* Stats Overview */}
                <div>
                  <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground mb-4 md:mb-6">
                    Your Progress Overview
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Day Streak KPI */}
                    <div className="bg-white rounded-xl p-4 border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <div className="font-body text-sm text-neutral-700">Day Streak</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="font-heading font-bold text-2xl text-primary">
                          {loading ? '...' : stats.streak}
                        </div>
                        {stats.streak > 0 && (
                          <span className="text-lg">🔥</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">
                        {stats.streak > 0 ? 'Keep it up!' : 'Start your first check-in'}
                      </div>
                    </div>

                    {/* Weekly Check-ins KPI */}
                    <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div className="font-body text-sm text-neutral-700">Weekly Check-ins</div>
                      </div>
                      <div className="font-heading font-bold text-2xl text-blue-600">
                        {loading ? '...' : stats.totalCheckins}
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">
                        This week
                      </div>
                    </div>

                    {/* Average Mood KPI */}
                    <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <div className="font-body text-sm text-neutral-700">Avg Mood</div>
                      </div>
                      <div className="font-heading font-bold text-2xl text-purple-600">
                        {loading ? '...' : stats.avgMood > 0 ? `${stats.avgMood}/10` : 'N/A'}
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">
                        Weekly average
                      </div>
                    </div>

                    {/* Goal Success KPI */}
                    <div className="bg-white rounded-xl p-4 border border-success-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-success" />
                        <div className="font-body text-sm text-neutral-700">Goal Success</div>
                      </div>
                      <div className="font-heading font-bold text-2xl text-success">
                        {loading ? '...' : stats.completionRate > 0 ? `${stats.completionRate}%` : 'N/A'}
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">
                        Weekly completion rate
                      </div>
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