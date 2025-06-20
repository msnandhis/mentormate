import React from 'react';
import { Play, ArrowRight, Star, Users, Zap } from 'lucide-react';

interface HeroProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-accent opacity-60" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4" />
              <span className="font-body text-sm font-medium">AI-Powered Accountability</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              Meet Your AI
              <span className="text-primary block">Accountability</span>
              Mentor
            </h1>

            {/* Subheadline */}
            <p className="font-body text-lg sm:text-xl text-neutral-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Daily video check-ins with personalized AI mentors who understand your goals, 
              track your progress, and keep you motivated every step of the way.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start space-x-8 mb-8">
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-foreground">95%</div>
                <div className="font-body text-sm text-neutral-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-foreground">50k+</div>
                <div className="font-body text-sm text-neutral-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-foreground">1M+</div>
                <div className="font-body text-sm text-neutral-600">Check-ins</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => onOpenAuth?.('signup')}
                className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group font-body px-8 py-4 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-lg">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-4 text-sm text-neutral-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Trusted by thousands</span>
              </div>
              <div className="w-1 h-1 bg-neutral-400 rounded-full" />
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>Results in 7 days</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-slide-up" style={{ animationDelay: '200ms' }}>
            {/* Main Video/Image Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-2xl">
                {/* Mock Video Interface */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="font-heading font-bold text-white">AI</span>
                    </div>
                    <div>
                      <div className="font-body font-semibold text-foreground">Coach Lex</div>
                      <div className="font-body text-sm text-neutral-600">Fitness Mentor</div>
                    </div>
                    <div className="ml-auto w-3 h-3 bg-success rounded-full animate-pulse" />
                  </div>
                  
                  {/* Mock Video */}
                  <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-4 flex items-center justify-center">
                    <Play className="w-12 h-12 text-neutral-400" />
                  </div>
                  
                  {/* Mock Message */}
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="font-body text-sm text-primary-800">
                      "Great job on yesterday's workout! I see you're building consistency. 
                      Let's tackle today's goals together 💪"
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="font-body text-xs font-medium">7-day streak!</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-body text-xs font-medium">Goal achieved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};