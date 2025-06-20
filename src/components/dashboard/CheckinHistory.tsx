import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Target, Heart, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins, Checkin, GoalStatus } from '../../lib/supabase';

export const CheckinHistory: React.FC = () => {
  const { user } = useAuth();
  const [checkinHistory, setCheckinHistory] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCheckin, setExpandedCheckin] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadCheckins();
  }, [user?.id]);

  const loadCheckins = async () => {
    if (!user?.id) return;
    
    try {
      const { checkins: userCheckins } = await checkins.getAll(user.id, 50);
      setCheckinHistory(userCheckins);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCheckins = checkinHistory.filter(checkin => {
    const checkinDate = new Date(checkin.created_at);
    const now = new Date();
    
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return checkinDate >= weekAgo;
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return checkinDate >= monthAgo;
    }
    
    return true;
  });

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'text-red-500 bg-red-50';
    if (score <= 5) return 'text-orange-500 bg-orange-50';
    if (score <= 7) return 'text-blue-500 bg-blue-50';
    return 'text-green-500 bg-green-50';
  };

  const getMoodLabel = (score: number) => {
    if (score <= 2) return 'Very Low';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Okay';
    if (score <= 8) return 'Good';
    return 'Great';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const calculateGoalCompletion = (goalStatus: GoalStatus[]) => {
    if (goalStatus.length === 0) return 0;
    const completed = goalStatus.filter(g => g.completed).length;
    return Math.round((completed / goalStatus.length) * 100);
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
    <div className="bg-white rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-xl text-foreground">
          Check-in History
        </h3>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'week' | 'month')}
            className="font-body text-sm border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>

      {filteredCheckins.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="font-body text-neutral-600">
            {filter === 'all' 
              ? "No check-ins yet. Complete your first check-in to get started!"
              : `No check-ins in the selected time period.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCheckins.map((checkin) => {
            const isExpanded = expandedCheckin === checkin.id;
            const goalCompletion = calculateGoalCompletion(checkin.goal_status);
            
            return (
              <div
                key={checkin.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedCheckin(isExpanded ? null : checkin.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getMoodColor(checkin.mood_score)}`}>
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-body font-medium text-foreground">
                          {formatDate(checkin.created_at)}
                        </span>
                        <span className="font-body text-sm text-neutral-600">
                          with {checkin.mentor?.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`font-body text-sm px-2 py-1 rounded-full ${getMoodColor(checkin.mood_score)}`}>
                          {getMoodLabel(checkin.mood_score)} ({checkin.mood_score}/10)
                        </span>
                        
                        {checkin.goal_status.length > 0 && (
                          <span className="font-body text-sm text-neutral-600">
                            Goals: {goalCompletion}% complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    {/* Goals */}
                    {checkin.goal_status.length > 0 && (
                      <div>
                        <h4 className="font-body font-medium text-foreground mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          Goals Progress
                        </h4>
                        <div className="space-y-2">
                          {checkin.goal_status.map((goal, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${goal.completed ? 'bg-success' : 'bg-neutral-300'}`} />
                              <div className="flex-1">
                                <div className={`font-body text-sm ${goal.completed ? 'text-success line-through' : 'text-foreground'}`}>
                                  {goal.goal_text}
                                </div>
                                {goal.notes && (
                                  <div className="font-body text-xs text-neutral-600 mt-1">
                                    {goal.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reflection */}
                    {checkin.reflection && (
                      <div>
                        <h4 className="font-body font-medium text-foreground mb-2 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Reflection
                        </h4>
                        <p className="font-body text-neutral-700 text-sm leading-relaxed bg-accent p-3 rounded-lg">
                          {checkin.reflection}
                        </p>
                      </div>
                    )}

                    {/* Mentor Info */}
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>
                        Checked in at {new Date(checkin.created_at).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                      <span className="capitalize">
                        {checkin.mode} mode
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};