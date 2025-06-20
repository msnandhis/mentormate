import React, { useState, useEffect } from 'react';
import { Heart, Target, MessageSquare, Send, Loader2, Smile, Meh, Frown, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkins, goals, mentors, Goal, Mentor, GoalStatus } from '../../lib/supabase';
import { MentorSelector } from '../mentors/MentorSelector';

interface CheckinFormProps {
  onComplete: () => void;
}

const moodOptions = [
  { value: 1, label: 'Very Low', icon: Frown, color: 'text-red-500' },
  { value: 2, label: 'Low', icon: Frown, color: 'text-red-400' },
  { value: 3, label: 'Below Average', icon: Meh, color: 'text-orange-500' },
  { value: 4, label: 'Neutral', icon: Meh, color: 'text-orange-400' },
  { value: 5, label: 'Okay', icon: Meh, color: 'text-neutral-500' },
  { value: 6, label: 'Good', icon: Smile, color: 'text-blue-500' },
  { value: 7, label: 'Very Good', icon: Smile, color: 'text-green-400' },
  { value: 8, label: 'Great', icon: Smile, color: 'text-green-500' },
  { value: 9, label: 'Excellent', icon: Smile, color: 'text-green-600' },
  { value: 10, label: 'Amazing', icon: Smile, color: 'text-green-700' },
];

export const CheckinForm: React.FC<CheckinFormProps> = ({ onComplete }) => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<'mentor' | 'checkin'>('mentor');
  const [loading, setLoading] = useState(false);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  
  const [formData, setFormData] = useState({
    mood_score: 5,
    reflection: '',
    goal_status: [] as GoalStatus[],
  });

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
      
      // Set default mentor from profile or first available
      if (profile?.default_mentor_id) {
        const defaultMentor = mentorsResult.mentors.find(m => m.id === profile.default_mentor_id);
        if (defaultMentor) {
          setSelectedMentor(defaultMentor);
          setCurrentStep('checkin');
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
    setCurrentStep('checkin');
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const selectedMoodOption = moodOptions.find(option => option.value === formData.mood_score);
  const MoodIcon = selectedMoodOption?.icon || Meh;

  // Step 1: Mentor Selection
  if (currentStep === 'mentor') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
            Daily Check-in
          </h2>
          <p className="font-body text-neutral-600">
            Which mentor would you like support from today?
          </p>
        </div>

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
    );
  }

  // Step 2: Check-in Form
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentStep('mentor')}
          className="flex items-center space-x-2 font-body text-neutral-600 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Mentor</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${selectedMentor?.gradient || 'from-primary-500 to-primary-600'} rounded-lg flex items-center justify-center`}>
            <span className="font-heading font-bold text-white text-sm">
              {selectedMentor?.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-body font-semibold text-foreground">
              {selectedMentor?.name}
            </div>
            <div className="font-body text-sm text-neutral-600 capitalize">
              {selectedMentor?.category}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          How are you doing today?
        </h2>
        <p className="font-body text-neutral-600">
          Let's check in with {selectedMentor?.name} and track your progress
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Assessment */}
        <div>
          <label className="block font-body font-medium text-foreground mb-4">
            How are you feeling today?
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4 p-6 bg-accent rounded-lg">
              <MoodIcon className={`w-12 h-12 ${selectedMoodOption?.color}`} />
              <div>
                <div className="font-body font-semibold text-lg text-foreground">
                  {selectedMoodOption?.label}
                </div>
                <div className="font-body text-neutral-600">
                  {formData.mood_score}/10
                </div>
              </div>
            </div>
            
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood_score}
                onChange={(e) => setFormData(prev => ({ ...prev, mood_score: parseInt(e.target.value) }))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Very Low</span>
                <span>Amazing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Status */}
        {userGoals.length > 0 && (
          <div>
            <label className="block font-body font-medium text-foreground mb-4">
              <Target className="w-5 h-5 inline mr-2" />
              How did you do with your goals?
            </label>
            <div className="space-y-3">
              {userGoals.map((goal) => {
                const status = formData.goal_status.find(s => s.goal_id === goal.id);
                return (
                  <div key={goal.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`goal-${goal.id}`}
                        checked={status?.completed || false}
                        onChange={(e) => handleGoalStatusChange(goal.id, e.target.checked)}
                        className="mt-1 w-5 h-5 text-primary bg-white border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`goal-${goal.id}`}
                          className={`font-body font-medium cursor-pointer ${
                            status?.completed ? 'text-success line-through' : 'text-foreground'
                          }`}
                        >
                          {goal.text}
                        </label>
                        <input
                          type="text"
                          placeholder="Add a note (optional)"
                          value={status?.notes || ''}
                          onChange={(e) => handleGoalStatusChange(goal.id, status?.completed || false, e.target.value)}
                          className="mt-2 w-full px-3 py-2 text-sm border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reflection */}
        <div>
          <label className="block font-body font-medium text-foreground mb-4">
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Any reflections or thoughts? (Optional)
          </label>
          <textarea
            value={formData.reflection}
            onChange={(e) => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
            placeholder={`Share what's on your mind with ${selectedMentor?.name}. Any challenges, wins, or insights you'd like to discuss...`}
            rows={4}
            className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedMentor}
          className="w-full flex items-center justify-center space-x-2 font-body px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
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
      </form>
    </div>
  );
};