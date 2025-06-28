import React from 'react';
import { Play, ArrowRight, Star, Users, Zap, Download, Smartphone } from 'lucide-react';

interface HeroProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4" />
              <span className="font-body text-sm font-medium">AI-Powered Daily Accountability</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-bold text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              One App for<br />
              <span className="text-primary">Every Goal</span>
            </h1>

            {/* Subheadline */}
            <p className="font-body text-xl text-neutral-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Transform your habits with personalized AI mentors who understand your goals, 
              track your progress, and keep you motivated every step of the way.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button 
                onClick={() => onOpenAuth?.('signup')}
                className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Zap className="w-5 h-5" />
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group font-body px-8 py-4 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-lg">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column - App Mockups */}
          <div className="relative">
            <div className="flex items-center justify-center space-x-8">
              {/* Phone Mockup 1 - Check-in Interface */}
              <div className="relative transform rotate-6 hover:rotate-3 transition-transform duration-300">
                <div className="w-64 h-[520px] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="h-6 bg-neutral-900 flex items-center justify-center">
                      <div className="w-20 h-1 bg-neutral-600 rounded-full"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 h-full bg-gradient-to-br from-primary-50 to-primary-100">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold text-lg">AI</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-foreground">Daily Check-in</h3>
                        <p className="text-sm text-neutral-600">with ZenKai</p>
                      </div>
                      
                      {/* Mood Selector */}
                      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                        <p className="text-sm font-medium text-foreground mb-2">How are you feeling?</p>
                        <div className="flex justify-between">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${i === 4 ? 'bg-primary text-white' : 'bg-neutral-100'}`}>
                              {i === 4 ? '😊' : '😐'}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Goals */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-medium text-foreground mb-2">Today's Goals</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-success rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xs text-foreground line-through">Morning workout</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border border-neutral-300 rounded-sm"></div>
                            <span className="text-xs text-foreground">Read for 30 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup 2 - Mentor Response */}
              <div className="relative transform -rotate-6 hover:-rotate-3 transition-transform duration-300">
                <div className="w-64 h-[520px] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="h-6 bg-neutral-900 flex items-center justify-center">
                      <div className="w-20 h-1 bg-neutral-600 rounded-full"></div>
                    </div>
                    
                    {/* Video Response Content */}
                    <div className="p-6 h-full bg-gradient-to-br from-blue-50 to-teal-50">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold text-lg">Z</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-foreground">ZenKai's Response</h3>
                        <p className="text-sm text-neutral-600">Your wellness mentor</p>
                      </div>
                      
                      {/* Video Preview */}
                      <div className="bg-neutral-900 rounded-xl aspect-video mb-4 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-80" />
                      </div>
                      
                      {/* Message Preview */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-foreground leading-relaxed">
                          "Great job on your morning workout! I can sense your positive energy. 
                          For your reading goal, try finding a quiet space..."
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-neutral-500">2 min ago</span>
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 right-8 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="font-body text-xs font-medium text-foreground">Live AI Support</span>
              </div>
            </div>

            <div className="absolute -bottom-4 left-8 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-body text-xs font-medium text-foreground">50k+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};