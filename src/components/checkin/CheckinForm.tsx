import React, { useState, useEffect } from 'react';
import { Heart, Target, MessageSquare, Send, Loader2, Smile, Meh, Frown, ArrowLeft, Calendar, Check, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins, goals, mentors, Goal, Mentor, GoalStatus } from '../../lib/supabase';
import { MentorSelector } from '../mentors/MentorSelector';

interface CheckinFormProps {
  onComplete: () => void;
}

const moodEmojis = [
  { value: 1, emoji: "😫", label: 'Very Low', icon: Frown, color: 'text-red-500 bg-red-50' },
  { value: 2, emoji: "😔", label: 'Low', icon: Frown, color: 'text-red-400 bg-red-50' },
  { value: 3, emoji: "😕", label: 'Below Average', icon: Meh, color: 'text-orange-500 bg-orange-50' },
  { value: 4, emoji: "😐", label: 'Neutral', icon: Meh, color: 'text-orange-400 bg-orange-50' },
  { value: 5, emoji: "🙂", label: 'Okay', icon: Meh, color: 'text-neutral-500 bg-neutral-100' },
  { value: 6, emoji: "😊", label: 'Good', icon: Smile, color: 'text-blue-500 bg-blue-50' },
  { value: 7, emoji: "😃", label: 'Very Good', icon: Smile, color: 'text-green-400 bg-green-50' },
  { value: 8, emoji: "😄", label: 'Great', icon: Smile, color: 'text-green-500 bg-green-50' },
  { value: 9, emoji: "😁", label: 'Excellent', icon: Smile, color: 'text-green-600 bg-green-50' },
  { value: 10, emoji: "🤩", label: 'Amazing', icon: Smile, color: 'text-green-700 bg-green-50' },
];

export const CheckinForm: React.FC<CheckinFormProps> = ({ onComplete }) => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<'mentor' | 'mood' | 'goals' | 'reflection' | 'summary'>('mentor');
  const [loading, setLoading] = useState(false);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({
    mentor: false,
    mood: false,
    goals: false,
    reflection: false
  });
  
  const [formData, setFormData] = useState({
    mood_score: 5,
    reflection: '',
    goal_status: [] as GoalStatus[],
  });
  
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      const [goalsResult, mentorsResult] = await Promise.all([
        goals.getAll(user.id),
        mentors.getAll(),
      ]);
      
      setUserGoals(goalsResult.goals);
      
      // Set default mentor from profile but don't automatically set as completed
      if (profile?.default_mentor_id) {
        const defaultMentor = mentorsResult.mentors.find(m => m.id === profile.default_mentor_id);
        if (defaultMentor) {
          setSelectedMentor(defaultMentor);
          // Don't set as completed automatically - user needs to click
          // setCompletedSteps(prev => ({ ...prev, mentor: true }));
        }
      }
      
      // Initialize goal status
      setFormData(prev => ({
        ...prev,
        goal_status: goalsResult.goals.map(goal => ({
          goal_id: goal.id,
          goal_text: goal.text,
          completed: false,
        }))
      }));
    } catch (error) {
      console.error('Error loading check-in data:', error);
    }
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setCompletedSteps(prev => ({ ...prev, mentor: true }));
    transitionToNextStep('mood');
  };

  const handleGoalStatusChange = (goalId: string, completed: boolean, notes?: string) => {
    setFormData(prev => ({
      ...prev,
      goal_status: prev.goal_status.map(status => 
        status.goal_id === goalId 
          ? { ...status, completed, notes } 
          : status
      )
    }));
    
    // Check if at least one goal has been interacted with
    const hasCompletedAnyGoal = formData.goal_status.some(status => status.completed);
    if (hasCompletedAnyGoal || completed) {
      setCompletedSteps(prev => ({ ...prev, goals: true }));
    }
  };

  const handleMoodChange = (value: number) => {
    setFormData(prev => ({ ...prev, mood_score: value }));
    setCompletedSteps(prev => ({ ...prev, mood: true }));
  };

  const handleReflectionChange = (text: string) => {
    setFormData(prev => ({ ...prev, reflection: text }));
    if (text.trim().length > 0) {
      setCompletedSteps(prev => ({ ...prev, reflection: true }));
    } else {
      setCompletedSteps(prev => ({ ...prev, reflection: false }));
    }
  };

  const transitionToNextStep = (nextStep: 'mentor' | 'mood' | 'goals' | 'reflection' | 'summary') => {
    setTransitionClass('opacity-0 translate-y-4');
    setTimeout(() => {
      setCurrentStep(nextStep);
      setTransitionClass('opacity-100 translate-y-0');
    }, 300);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'mentor': return completedSteps.mentor;
      case 'mood': return completedSteps.mood;
      case 'goals': return userGoals.length === 0 || completedSteps.goals;
      case 'reflection': return true; // Reflection is optional
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !selectedMentor) return;
    
    setLoading(true);
    try {
      await checkins.create({
        user_id: user.id,
        mentor_id: selectedMentor.id,
        mode: profile?.preferred_mode || 'classic',
        mood_score: formData.mood_score,
        reflection: formData.reflection.trim() || undefined,
        goal_status: formData.goal_status,
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedMoodOption = moodEmojis.find(option => option.value === formData.mood_score);
  const MoodIcon = selectedMoodOption?.icon || Meh;

  const getStepNumber = () => {
    const steps = ['mentor', 'mood', 'goals', 'reflection', 'summary'];
    return steps.indexOf(currentStep) + 1;
  };

  const totalSteps = 5;

  // Mentor Selection Step
  if (currentStep === 'mentor') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-body text-sm text-neutral-600">
                Step {getStepNumber()} of {totalSteps}
              </span>
            </div>
            <span className="font-body text-sm text-neutral-600">
              {Math.round((getStepNumber() / totalSteps) * 100)}% Complete
            </span>
          </div>
          
          <div className="relative mt-2">
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-full h-2 transition-all duration-700 ease-out"
                style={{ width: `${(getStepNumber() / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className={`transition-all duration-300 ${transitionClass}`}>
          <MentorSelector
            selectedMentor={selectedMentor}
            onSelectMentor={handleMentorSelect}
            size="medium"
            title="Choose Your Mentor for Today"
            description="Each mentor brings a unique perspective and approach to help you achieve your goals."
          />

          {/* Skip to default mentor if available */}
          {profile?.default_mentor_id && !selectedMentor && (
            <div className="mt-8 text-center">
              <button
                onClick={() => loadData()}
                className="font-body text-primary hover:text-primary-600 transition-colors"
              >
                Use my default mentor instead
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Progress Tracker */}
      <div className="p-4 bg-primary text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="font-body">
              Step {getStepNumber()} of {totalSteps}
            </span>
          </div>
          <span className="font-body">
            {Math.round((getStepNumber() / totalSteps) * 100)}% Complete
          </span>
        </div>
        
        <div className="relative mt-2">
          <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-700 ease-out"
              style={{ width: `${(getStepNumber() / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Header with Mentor */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const prevSteps = {
                mood: 'mentor',
                goals: 'mood',
                reflection: 'goals',
                summary: 'reflection'
              };
              transitionToNextStep(prevSteps[currentStep as keyof typeof prevSteps] || 'mentor');
            }}
            className="flex items-center space-x-2 font-body text-neutral-600 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 'mood' ? 'Change Mentor' : 'Back'}</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${selectedMentor?.gradient || 'from-primary-500 to-primary-600'} rounded-lg flex items-center justify-center shadow-md`}>
              <span className="font-heading font-bold text-white text-sm">
                {selectedMentor?.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-body font-semibold text-foreground">
                {selectedMentor?.name}
              </div>
              <div className="font-body text-sm text-neutral-600 capitalize">
                {selectedMentor?.category} mentor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`p-6 transition-all duration-300 ${transitionClass}`}>
        {/* Mood Assessment */}
        {currentStep === 'mood' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                How are you feeling today?
              </h2>
              <p className="font-body text-neutral-600">
                Let's check in with {selectedMentor?.name} about your current mood
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-border shadow-md">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 ${selectedMoodOption?.color} rounded-full flex items-center justify-center mx-auto mb-3 text-3xl`}>
                  {selectedMoodOption?.emoji}
                </div>
                <div className="font-heading font-bold text-xl text-foreground">
                  {selectedMoodOption?.label}
                </div>
                <div className="font-body text-neutral-600">
                  {formData.mood_score}/10
                </div>
              </div>
              
              <div className="px-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood_score}
                  onChange={(e) => handleMoodChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                />
                
                {/* Emoji Scale */}
                <div className="mt-4 flex justify-between">
                  {[1, 4, 7, 10].map((value) => {
                    const mood = moodEmojis.find(m => m.value === value);
                    return (
                      <div key={value} className="flex flex-col items-center">
                        <span className="text-xl mb-1">{mood?.emoji}</span>
                        <span className="text-xs text-neutral-500">{mood?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-accent rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-neutral-500 mt-0.5" />
                  <p className="font-body text-neutral-600 text-sm">
                    Tracking your mood helps {selectedMentor?.name} provide personalized guidance and helps you identify patterns over time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => transitionToNextStep('goals')}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Goal Status */}
        {currentStep === 'goals' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Track Your Goals
              </h2>
              <p className="font-body text-neutral-600">
                Update your progress on these goals for {selectedMentor?.name}'s feedback
              </p>
            </div>

            {userGoals.length > 0 ? (
              <div className="space-y-4">
                {userGoals.map((goal) => {
                  const status = formData.goal_status.find(s => s.goal_id === goal.id);
                  return (
                    <div key={goal.id} className={`p-5 rounded-xl border-2 transition-all ${
                      status?.completed 
                        ? 'border-success bg-success-50 shadow-md' 
                        : 'border-border hover:border-primary-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          <div 
                            onClick={() => handleGoalStatusChange(goal.id, !status?.completed)}
                            className={`w-6 h-6 flex-shrink-0 border-2 rounded-md cursor-pointer transition-all flex items-center justify-center ${
                              status?.completed 
                                ? 'border-success bg-success text-white' 
                                : 'border-neutral-300'
                            }`}
                          >
                            {status?.completed && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <label 
                            className={`font-body font-semibold cursor-pointer text-lg ${
                              status?.completed ? 'text-success' : 'text-foreground'
                            }`}
                          >
                            {goal.text}
                          </label>
                          <input
                            type="text"
                            placeholder="Add a note about your progress..."
                            value={status?.notes || ''}
                            onChange={(e) => handleGoalStatusChange(goal.id, status?.completed || false, e.target.value)}
                            className={`mt-3 w-full px-3 py-2 border rounded-lg font-body text-sm transition-colors ${
                              status?.completed
                                ? 'border-success/30 bg-success/5 text-success-700 placeholder-success-300'
                                : 'border-border text-foreground placeholder-neutral-500'
                            } focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-xl">
                <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-foreground mb-2">
                  No goals set yet
                </h3>
                <p className="font-body text-neutral-600 mb-4">
                  You'll be able to add goals after your first check-in
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => transitionToNextStep('reflection')}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Reflection */}
        {currentStep === 'reflection' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Share Your Thoughts
              </h2>
              <p className="font-body text-neutral-600">
                Tell {selectedMentor?.name} what's on your mind today (optional)
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-md">
              <textarea
                value={formData.reflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder={`What's been on your mind lately? Feel free to share your thoughts, challenges, or wins with ${selectedMentor?.name}...`}
                rows={8}
                className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
              
              <div className="mt-4 p-4 bg-accent rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="font-body text-neutral-600 text-sm">
                      Sharing your thoughts helps {selectedMentor?.name} provide more personalized guidance.
                    </p>
                    <p className="font-body text-neutral-600 text-sm mt-1">
                      Your reflections also help you build self-awareness over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => transitionToNextStep('goals')}
                className="flex items-center space-x-2 px-6 py-3 text-neutral-600 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                onClick={() => transitionToNextStep('summary')}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {currentStep === 'summary' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Ready to Submit
              </h2>
              <p className="font-body text-neutral-600">
                Let's review your check-in before submitting to {selectedMentor?.name}
              </p>
            </div>

            <div className="space-y-4">
              {/* Mood Summary */}
              <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Your Mood Today
                  </h3>
                  <button
                    onClick={() => transitionToNextStep('mood')}
                    className="text-sm text-primary hover:text-primary-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-3 flex items-center space-x-3">
                  <div className={`w-10 h-10 ${selectedMoodOption?.color} rounded-full flex items-center justify-center text-xl`}>
                    {selectedMoodOption?.emoji}
                  </div>
                  <div>
                    <div className="font-body font-medium text-foreground">
                      {selectedMoodOption?.label}
                    </div>
                    <div className="font-body text-sm text-neutral-600">
                      {formData.mood_score}/10
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Summary */}
              {userGoals.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      Goal Progress
                    </h3>
                    <button
                      onClick={() => transitionToNextStep('goals')}
                      className="text-sm text-primary hover:text-primary-600 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {formData.goal_status.map((status) => (
                      <div key={status.goal_id} className="flex items-start space-x-3">
                        <div className={`w-5 h-5 mt-0.5 rounded-md flex-shrink-0 flex items-center justify-center ${
                          status.completed 
                            ? 'bg-success text-white' 
                            : 'border border-neutral-300'
                        }`}>
                          {status.completed && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className={`font-body font-medium ${
                            status.completed ? 'text-success' : 'text-foreground'
                          }`}>
                            {status.goal_text}
                          </div>
                          {status.notes && (
                            <div className="font-body text-sm text-neutral-600 mt-1">
                              Note: {status.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-neutral-600">
                    {formData.goal_status.filter(g => g.completed).length}/{formData.goal_status.length} goals completed
                  </div>
                </div>
              )}

              {/* Reflection Summary */}
              <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Your Reflection
                  </h3>
                  <button
                    onClick={() => transitionToNextStep('reflection')}
                    className="text-sm text-primary hover:text-primary-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-3">
                  {formData.reflection ? (
                    <p className="font-body text-neutral-700">
                      {formData.reflection}
                    </p>
                  ) : (
                    <p className="font-body text-neutral-500 italic">
                      No reflection added (optional)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 font-body px-6 py-4 bg-gradient-to-r from-primary to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Check-in...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Complete Check-in with {selectedMentor?.name}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};