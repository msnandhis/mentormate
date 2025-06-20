import React from 'react';
import { Check, Sparkles, Calendar, Target } from 'lucide-react';
import { Mentor } from '../../lib/supabase';

interface OnboardingCompleteProps {
  mentor: Mentor | null;
  mode: 'classic' | 'realtime';
  goals: string[];
}

export const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({
  mentor,
  mode,
  goals,
}) => {
  const handleGetStarted = () => {
    // This will be handled by the parent component (App.tsx) when profile is refreshed
    window.location.reload();
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
          <Check className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-8 animate-bounce">
          <Sparkles className="w-8 h-8 text-warning" />
        </div>
      </div>

      {/* Completion Message */}
      <h1 className="font-heading font-bold text-3xl text-foreground mb-4">
        You're All Set! 🎉
      </h1>
      <p className="font-body text-lg text-neutral-600 mb-8">
        Your personalized accountability system is ready. Here's what we've set up for you:
      </p>

      {/* Setup Summary */}
      <div className="space-y-6 mb-8">
        {/* Mentor */}
        <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="font-heading font-bold text-white">AI</span>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-primary-800">
                Your Mentor: {mentor?.name}
              </h3>
              <p className="font-body text-primary-700 capitalize">
                {mentor?.category} • {mentor?.tone} personality
              </p>
            </div>
          </div>
        </div>

        {/* Mode */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-blue-800">
                Check-in Style: {mode === 'classic' ? 'Classic' : 'Real-Time Chat'}
              </h3>
              <p className="font-body text-blue-700">
                {mode === 'classic' 
                  ? 'Quick daily forms with video responses' 
                  : 'Live conversations with your AI mentor'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-purple-800 mb-3">
                Your Goals ({goals.length})
              </h3>
              <div className="space-y-2">
                {goals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span className="font-body text-purple-700">{goal}</span>
                  </div>
                ))}
                {goals.length > 3 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="font-body text-purple-600">
                      +{goals.length - 3} more goals
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-6 bg-gradient-to-r from-accent to-primary-50 rounded-xl mb-8">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          What happens next?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-left">
          <div>
            <div className="font-body font-medium text-foreground mb-2">
              1. Daily Check-ins
            </div>
            <p className="font-body text-neutral-600 text-sm">
              Start your first check-in and receive personalized guidance
            </p>
          </div>
          <div>
            <div className="font-body font-medium text-foreground mb-2">
              2. Track Progress
            </div>
            <p className="font-body text-neutral-600 text-sm">
              Watch your streaks grow and see insights about your habits
            </p>
          </div>
          <div>
            <div className="font-body font-medium text-foreground mb-2">
              3. Weekly Forecasts
            </div>
            <p className="font-body text-neutral-600 text-sm">
              Get personalized predictions and motivation every Sunday
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleGetStarted}
        className="w-full font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
      >
        <span>Start Your First Check-in</span>
        <Sparkles className="w-5 h-5" />
      </button>
    </div>
  );
};