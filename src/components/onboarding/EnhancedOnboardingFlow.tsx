import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Star, Target, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentors, profiles, goals, Mentor } from '../../lib/supabase';
import { MentorSelection } from './MentorSelection';
import { ModeSelection } from './ModeSelection';
import { GoalSetting } from './GoalSetting';
import { OnboardingComplete } from './OnboardingComplete';

type OnboardingStep = 'welcome' | 'mentor' | 'mode' | 'goals' | 'complete';

export const EnhancedOnboardingFlow: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedMode, setSelectedMode] = useState<'classic' | 'realtime'>('classic');
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const loadMentors = async () => {
      const { mentors: mentorList } = await mentors.getAll();
      setAvailableMentors(mentorList);
    };
    loadMentors();
    
    // Trigger entrance animation
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'mentor', 'mode', 'goals', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setAnimate(false);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex + 1]);
        setAnimate(true);
      }, 150);
    }
  };

  const handleBack = () => {
    const steps: OnboardingStep[] = ['welcome', 'mentor', 'mode', 'goals', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setAnimate(false);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex - 1]);
        setAnimate(true);
      }, 150);
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
        {/* Progress Bar with Enhanced Design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-body text-sm text-neutral-600">
                Step {getStepNumber()} of 5
              </span>
            </div>
            <span className="font-body text-sm text-neutral-600">
              {Math.round((getStepNumber() / 5) * 100)}% Complete
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-full h-3 transition-all duration-700 ease-out relative"
                style={{ width: `${(getStepNumber() / 5) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="absolute top-0 w-full flex justify-between items-center h-3">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    step <= getStepNumber()
                      ? 'bg-primary border-primary-600 scale-110'
                      : 'bg-white border-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`bg-white rounded-2xl p-8 shadow-2xl border border-white/50 transition-all duration-500 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {currentStep === 'welcome' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Star className="w-6 h-6 text-warning" />
                </div>
              </div>
              
              <h1 className="font-heading font-bold text-4xl text-foreground mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Welcome to MentorMate!
              </h1>
              
              <p className="font-body text-xl text-neutral-600 mb-8 leading-relaxed">
                Let's create your personalized AI accountability experience. We'll help you choose 
                the perfect mentor and set up your daily check-in routine for maximum success.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-blue-800 mb-2">Choose Your Mentor</h3>
                  <p className="font-body text-sm text-blue-700">Select an AI mentor that matches your goals and personality</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-purple-800 mb-2">Set Your Style</h3>
                  <p className="font-body text-sm text-purple-700">Choose between quick check-ins or live conversations</p>
                </div>
                
                <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-green-800 mb-2">Define Your Goals</h3>
                  <p className="font-body text-sm text-green-700">Set meaningful goals that drive real progress</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-primary-50 to-accent rounded-xl border border-primary-200">
                <p className="font-body text-primary-800 font-medium">
                  🚀 Ready to transform your habits with AI-powered accountability?
                </p>
              </div>
            </div>
          )}

          {currentStep === 'mentor' && (
            <div className={`transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <MentorSelection
                mentors={availableMentors}
                selectedMentor={selectedMentor}
                onSelectMentor={setSelectedMentor}
              />
            </div>
          )}

          {currentStep === 'mode' && (
            <div className={`transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <ModeSelection
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
              />
            </div>
          )}

          {currentStep === 'goals' && (
            <div className={`transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <GoalSetting
                goals={userGoals}
                onUpdateGoals={setUserGoals}
              />
            </div>
          )}

          {currentStep === 'complete' && (
            <div className={`transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <OnboardingComplete
                mentor={selectedMentor}
                mode={selectedMode}
                goals={userGoals}
              />
            </div>
          )}

          {/* Enhanced Navigation */}
          {currentStep !== 'complete' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                disabled={currentStep === 'welcome'}
                className="group flex items-center space-x-2 font-body px-6 py-3 text-neutral-600 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg hover:bg-neutral-50"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>

              {currentStep === 'goals' ? (
                <button
                  onClick={handleComplete}
                  disabled={!isStepValid() || loading}
                  className="group flex items-center space-x-2 font-body px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="group flex items-center space-x-2 font-body px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Floating Help Hint */}
        <div className="mt-6 text-center">
          <p className="font-body text-sm text-neutral-500">
            Questions? Your AI mentor will guide you every step of the way 🤖
          </p>
        </div>
      </div>
    </div>
  );
};