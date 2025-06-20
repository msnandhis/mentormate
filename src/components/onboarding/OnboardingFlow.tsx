import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, profiles, goals, Mentor } from '../../lib/supabase';
import { MentorSelection } from './MentorSelection';
import { ModeSelection } from './ModeSelection';
import { GoalSetting } from './GoalSetting';
import { OnboardingComplete } from './OnboardingComplete';

type OnboardingStep = 'welcome' | 'mentor' | 'mode' | 'goals' | 'complete';

export const OnboardingFlow: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedMode, setSelectedMode] = useState<'classic' | 'realtime'>('classic');
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMentors = async () => {
      const { mentors: mentorList } = await mentors.getAll();
      setAvailableMentors(mentorList);
    };
    loadMentors();
  }, []);

  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'mentor', 'mode', 'goals', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: OnboardingStep[] = ['welcome', 'mentor', 'mode', 'goals', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = async () => {
    if (!user || !selectedMentor) return;
    
    setLoading(true);
    try {
      // Complete onboarding
      await profiles.completeOnboarding(user.id, selectedMentor.id, selectedMode);
      
      // Create goals
      if (userGoals.length > 0) {
        await goals.createMultiple(user.id, userGoals);
      }
      
      // Refresh profile to update context
      await refreshProfile();
      
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    const stepNumbers = {
      welcome: 1,
      mentor: 2,
      mode: 3,
      goals: 4,
      complete: 5
    };
    return stepNumbers[currentStep];
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'mentor':
        return selectedMentor !== null;
      case 'mode':
        return selectedMode !== null;
      case 'goals':
        return userGoals.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-sm text-neutral-600">
              Step {getStepNumber()} of 5
            </span>
            <span className="font-body text-sm text-neutral-600">
              {Math.round((getStepNumber() / 5) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${(getStepNumber() / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {currentStep === 'welcome' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-4">
                Welcome to MentorMate!
              </h1>
              <p className="font-body text-lg text-neutral-600 mb-8">
                Let's personalize your accountability experience. We'll help you choose 
                the perfect AI mentor and set up your daily check-in routine.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading font-bold text-primary text-lg">1</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Choose Your Mentor</h3>
                  <p className="font-body text-sm text-neutral-600">Select an AI mentor that matches your goals</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading font-bold text-primary text-lg">2</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Pick Your Style</h3>
                  <p className="font-body text-sm text-neutral-600">Choose between quick check-ins or live conversations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading font-bold text-primary text-lg">3</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Set Your Goals</h3>
                  <p className="font-body text-sm text-neutral-600">Define what you want to achieve</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'mentor' && (
            <MentorSelection
              mentors={availableMentors}
              selectedMentor={selectedMentor}
              onSelectMentor={setSelectedMentor}
            />
          )}

          {currentStep === 'mode' && (
            <ModeSelection
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
            />
          )}

          {currentStep === 'goals' && (
            <GoalSetting
              goals={userGoals}
              onUpdateGoals={setUserGoals}
            />
          )}

          {currentStep === 'complete' && (
            <OnboardingComplete
              mentor={selectedMentor}
              mode={selectedMode}
              goals={userGoals}
            />
          )}

          {/* Navigation */}
          {currentStep !== 'complete' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                disabled={currentStep === 'welcome'}
                className="flex items-center space-x-2 font-body px-6 py-3 text-neutral-600 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {currentStep === 'goals' ? (
                <button
                  onClick={handleComplete}
                  disabled={!isStepValid() || loading}
                  className="flex items-center space-x-2 font-body px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Completing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Complete Setup</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 font-body px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};