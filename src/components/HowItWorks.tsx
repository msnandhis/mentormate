import React from 'react';
import { UserPlus, Target, Video, BarChart3, MessageSquare, Zap } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column - How It Works Steps */}
          <div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
              How MentorMate Works?
            </h2>
            <p className="font-body text-lg text-neutral-600 mb-12">
              Start building better habits with AI-powered accountability in just 3 simple steps.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-heading font-bold text-white">01</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    Choose Your AI Mentor
                  </h3>
                  <p className="font-body text-neutral-600">
                    Select from specialized mentors including fitness coaches, wellness guides, 
                    productivity experts, and career advisors. Each with unique personalities 
                    and expertise areas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-heading font-bold text-white">02</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    Set Your Goals & Preferences
                  </h3>
                  <p className="font-body text-neutral-600">
                    Define your goals and choose between quick daily check-ins or 
                    live video conversations. Your mentor adapts to your schedule 
                    and communication style.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-heading font-bold text-white">03</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    Get Daily Accountability
                  </h3>
                  <p className="font-body text-neutral-600">
                    Receive personalized video responses, track your progress, 
                    and get insights that help you build lasting habits. Your 
                    mentor learns and adapts to support you better over time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content Sections */}
          <div className="space-y-8">
            {/* Testimonial Card */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16" />
              
              <div className="relative z-10">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-bold text-primary text-xl">SC</span>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xl mb-1">Sarah Chen</div>
                    <div className="text-primary-100">Product Manager</div>
                  </div>
                </div>
                
                <blockquote className="font-body text-lg leading-relaxed mb-4">
                  "MentorMate completely changed my morning routine. Having Coach Lex check in 
                  with me daily has kept me consistent with workouts for the first time in years."
                </blockquote>
                
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-4 h-4 text-warning">★</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Cards */}
            <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Manage Your Goals Better than Before
                  </h3>
                </div>
              </div>
              
              <p className="font-body text-neutral-600 mb-6">
                Track multiple goals simultaneously with intelligent prioritization. 
                Get insights into your patterns and receive recommendations for better results.
              </p>
              
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-4">
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Control Every Step You Take
                  </h3>
                </div>
              </div>
              
              <p className="font-body text-neutral-600 mb-6">
                Monitor daily progress with detailed analytics. Set custom reminders 
                and get proactive nudges when you need motivation most.
              </p>
              
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-4">
                <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Target className="w-12 h-12 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};