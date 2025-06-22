import React, { useState, useEffect } from 'react';
import { Lightbulb, Target, Plus, TrendingUp, Brain, Star, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins, goals as goalsService, mentors, Goal } from '../../lib/supabase';

interface GoalRecommendation {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  category: 'fitness' | 'wellness' | 'study' | 'career' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;
  relatedGoals?: string[];
  aiGenerated: boolean;
}

export const GoalRecommendations: React.FC = () => {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingGoal, setAddingGoal] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
    }
  }, [user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Load user's current goals and check-in data
      const [goalsResult, checkinsResult, mentorsResult] = await Promise.all([
        goalsService.getAll(user.id),
        checkins.getAll(user.id, 50),
        mentors.getAll(),
      ]);

      setUserGoals(goalsResult.goals);

      // Generate recommendations based on user data
      const generatedRecommendations = await generateRecommendations(
        goalsResult.goals,
        checkinsResult.checkins,
        mentorsResult.mentors,
        profile
      );

      setRecommendations(generatedRecommendations);
    } catch (error) {
      console.error('Error loading goal recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (
    currentGoals: Goal[],
    recentCheckins: any[],
    availableMentors: any[],
    userProfile: any
  ): Promise<GoalRecommendation[]> => {
    const recommendations: GoalRecommendation[] = [];

    // Analyze user patterns
    const analysis = analyzeUserPatterns(currentGoals, recentCheckins);
    
    // Try to get AI-generated recommendations first
    try {
      const aiRecommendations = await getAIRecommendations(analysis, userProfile, availableMentors);
      recommendations.push(...aiRecommendations);
    } catch (error) {
      console.warn('AI recommendations failed, using fallback:', error);
    }

    // Add fallback recommendations based on patterns
    const fallbackRecommendations = getFallbackRecommendations(analysis, currentGoals);
    recommendations.push(...fallbackRecommendations);

    // Remove duplicates and limit to top 6
    const uniqueRecommendations = recommendations
      .filter((rec, index, arr) => 
        arr.findIndex(r => r.title.toLowerCase() === rec.title.toLowerCase()) === index
      )
      .slice(0, 6);

    return uniqueRecommendations;
  };

  const analyzeUserPatterns = (goals: Goal[], checkins: any[]) => {
    const analysis = {
      goalCategories: {} as { [key: string]: number },
      completionRates: {} as { [key: string]: number },
      strugglingAreas: [] as string[],
      strongAreas: [] as string[],
      avgMood: 0,
      checkInFrequency: 0,
      lastWeekCheckins: 0,
    };

    // Analyze goal completion patterns
    const goalPerformance: { [key: string]: { total: number; completed: number } } = {};
    
    checkins.forEach(checkin => {
      const goalStatus = checkin.goal_status || [];
      goalStatus.forEach((goal: any) => {
        if (!goalPerformance[goal.goal_text]) {
          goalPerformance[goal.goal_text] = { total: 0, completed: 0 };
        }
        goalPerformance[goal.goal_text].total++;
        if (goal.completed) {
          goalPerformance[goal.goal_text].completed++;
        }
      });
    });

    // Identify struggling and strong areas
    Object.entries(goalPerformance).forEach(([goalText, performance]) => {
      const completionRate = performance.completed / performance.total;
      if (completionRate < 0.4 && performance.total >= 3) {
        analysis.strugglingAreas.push(goalText);
      } else if (completionRate > 0.8 && performance.total >= 3) {
        analysis.strongAreas.push(goalText);
      }
    });

    // Calculate other metrics
    if (checkins.length > 0) {
      analysis.avgMood = checkins.reduce((sum, c) => sum + c.mood_score, 0) / checkins.length;
      analysis.checkInFrequency = checkins.length;
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      analysis.lastWeekCheckins = checkins.filter(
        c => new Date(c.created_at) >= lastWeek
      ).length;
    }

    return analysis;
  };

  const getAIRecommendations = async (
    analysis: any,
    userProfile: any,
    mentors: any[]
  ): Promise<GoalRecommendation[]> => {
    // This would call the AI mentor function to generate personalized recommendations
    const response = await fetch(`/functions/v1/ai-mentor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        mentor: {
          id: 'goal_advisor',
          name: 'Goal Advisor',
          category: 'productivity',
          personality: 'analytical and encouraging',
          speaking_style: 'practical and supportive',
          motivation_approach: 'data-driven with empathy',
          prompt_template: 'You are an expert goal-setting advisor. Analyze user patterns and suggest specific, achievable goals.',
          response_style: {
            tone: 'encouraging',
            emoji_use: 'minimal',
            encouragement_level: 'high',
            challenge_level: 'medium'
          }
        },
        user_message: 'Based on my patterns, what new goals should I consider?',
        context: {
          mood_score: Math.round(analysis.avgMood),
          goals: analysis,
          reflection: `User has ${analysis.strugglingAreas.length} struggling areas and ${analysis.strongAreas.length} strong areas.`,
          streak: analysis.lastWeekCheckins
        },
        session_type: 'recommendation'
      }),
    });

    if (!response.ok) {
      throw new Error('AI recommendation failed');
    }

    const result = await response.json();
    
    // Parse AI response into structured recommendations
    return parseAIResponse(result.response);
  };

  const parseAIResponse = (aiResponse: string): GoalRecommendation[] => {
    // This is a simplified parser - in a real implementation, you'd want more sophisticated parsing
    const recommendations: GoalRecommendation[] = [];
    
    // For demo purposes, create sample recommendations based on AI response
    if (aiResponse.toLowerCase().includes('exercise') || aiResponse.toLowerCase().includes('fitness')) {
      recommendations.push({
        id: 'ai-fitness-1',
        title: 'Start a 10-minute morning routine',
        description: 'Begin each day with light stretching or walking',
        reasoning: 'Based on your patterns, adding consistent morning movement could boost your energy and mood',
        category: 'fitness',
        difficulty: 'easy',
        estimatedDuration: '10 minutes daily',
        aiGenerated: true
      });
    }

    if (aiResponse.toLowerCase().includes('meditation') || aiResponse.toLowerCase().includes('mindful')) {
      recommendations.push({
        id: 'ai-wellness-1',
        title: 'Practice 5-minute mindfulness',
        description: 'Daily mindfulness practice to improve focus and reduce stress',
        reasoning: 'Your check-in patterns suggest this could help with consistency and mood',
        category: 'wellness',
        difficulty: 'easy',
        estimatedDuration: '5 minutes daily',
        aiGenerated: true
      });
    }

    return recommendations;
  };

  const getFallbackRecommendations = (analysis: any, currentGoals: Goal[]): GoalRecommendation[] => {
    const recommendations: GoalRecommendation[] = [];
    const existingGoalTexts = currentGoals.map(g => g.text.toLowerCase());

    // Base recommendations based on patterns
    const fallbackRecommendations = [
      {
        id: 'hydration-1',
        title: 'Drink 8 glasses of water daily',
        description: 'Track water intake to improve overall health and energy',
        reasoning: 'Hydration supports all other wellness goals and is easy to track',
        category: 'wellness' as const,
        difficulty: 'easy' as const,
        estimatedDuration: 'Throughout the day',
        aiGenerated: false
      },
      {
        id: 'gratitude-1',
        title: 'Write 3 things I\'m grateful for',
        description: 'Daily gratitude practice to improve mood and mindset',
        reasoning: 'Gratitude practice is scientifically proven to boost mood and life satisfaction',
        category: 'wellness' as const,
        difficulty: 'easy' as const,
        estimatedDuration: '5 minutes daily',
        aiGenerated: false
      },
      {
        id: 'reading-1',
        title: 'Read for 15 minutes daily',
        description: 'Build a consistent reading habit for personal growth',
        reasoning: 'Reading expands knowledge and can be easily integrated into daily routine',
        category: 'study' as const,
        difficulty: 'easy' as const,
        estimatedDuration: '15 minutes daily',
        aiGenerated: false
      },
      {
        id: 'exercise-1',
        title: 'Take a 20-minute walk',
        description: 'Daily walking for physical and mental health',
        reasoning: 'Walking is accessible, improves mood, and builds consistency',
        category: 'fitness' as const,
        difficulty: 'easy' as const,
        estimatedDuration: '20 minutes daily',
        aiGenerated: false
      },
      {
        id: 'skills-1',
        title: 'Learn something new for 10 minutes',
        description: 'Daily learning to develop new skills or knowledge',
        reasoning: 'Continuous learning keeps the mind active and opens new opportunities',
        category: 'study' as const,
        difficulty: 'medium' as const,
        estimatedDuration: '10 minutes daily',
        aiGenerated: false
      },
      {
        id: 'planning-1',
        title: 'Plan tomorrow tonight',
        description: 'Spend 10 minutes each evening planning the next day',
        reasoning: 'Planning ahead reduces stress and improves productivity',
        category: 'career' as const,
        difficulty: 'easy' as const,
        estimatedDuration: '10 minutes daily',
        aiGenerated: false
      }
    ];

    // Filter out goals that are too similar to existing ones
    const filteredRecommendations = fallbackRecommendations.filter(rec => {
      return !existingGoalTexts.some(existing => 
        existing.includes(rec.title.toLowerCase().split(' ')[0]) ||
        rec.title.toLowerCase().includes(existing.split(' ')[0])
      );
    });

    // Prioritize based on user patterns
    if (analysis.avgMood < 6) {
      // Prioritize mood-boosting goals
      const moodGoals = filteredRecommendations.filter(r => 
        r.category === 'wellness' || r.title.includes('gratitude') || r.title.includes('walk')
      );
      recommendations.push(...moodGoals.slice(0, 2));
    }

    if (analysis.strugglingAreas.length > 2) {
      // Suggest easier goals to build confidence
      const easyGoals = filteredRecommendations.filter(r => r.difficulty === 'easy');
      recommendations.push(...easyGoals.slice(0, 2));
    }

    // Add remaining recommendations
    const remaining = filteredRecommendations.filter(r => 
      !recommendations.some(existing => existing.id === r.id)
    );
    recommendations.push(...remaining.slice(0, 3));

    return recommendations.slice(0, 4);
  };

  const addGoalFromRecommendation = async (recommendation: GoalRecommendation) => {
    if (!user?.id) return;

    setAddingGoal(recommendation.id);
    try {
      const { data, error } = await goalsService.create(user.id, recommendation.title);
      
      if (error) {
        throw error;
      }

      if (data) {
        setUserGoals(prev => [...prev, data]);
        // Remove the recommendation since it's now added
        setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setAddingGoal(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return '💪';
      case 'wellness': return '🧘';
      case 'study': return '📚';
      case 'career': return '💼';
      default: return '🎯';
    }
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">
            Personalized Goal Recommendations
          </h2>
          <p className="font-body text-neutral-600">
            AI-powered suggestions based on your patterns and progress
          </p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-2">
            Great job! You're well-balanced
          </h3>
          <p className="font-body text-neutral-600">
            Based on your current goals and progress, you have a solid foundation. 
            Keep up the great work with your existing goals!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(recommendation.category)}</span>
                  <h3 className="font-heading font-semibold text-foreground">
                    {recommendation.title}
                  </h3>
                  {recommendation.aiGenerated && (
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-purple-600 font-medium">AI</span>
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                  {recommendation.difficulty}
                </span>
              </div>

              <p className="font-body text-neutral-700 text-sm mb-3">
                {recommendation.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-xs text-neutral-600">
                  <Clock className="w-3 h-3" />
                  <span>{recommendation.estimatedDuration}</span>
                </div>
                
                <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <strong>Why this goal:</strong> {recommendation.reasoning}
                </div>
              </div>

              <button
                onClick={() => addGoalFromRecommendation(recommendation)}
                disabled={addingGoal === recommendation.id}
                className="w-full flex items-center justify-center space-x-2 font-body px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingGoal === recommendation.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Goal</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-body font-semibold text-purple-800 mb-1">
                Smart Goal Selection
              </h4>
              <p className="font-body text-purple-700 text-sm">
                These recommendations are personalized based on your check-in patterns, 
                current goals, and areas where you might benefit from additional focus. 
                Start with easier goals to build momentum!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};