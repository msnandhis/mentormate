import React from 'react';
import { ArrowRight, CheckCircle, Video, MessageSquare, Brain, BarChart3 } from 'lucide-react';

export const FeaturesShowcase: React.FC = () => {
  const features = [
    {
      number: '01',
      title: 'Unlimited Check-ins',
      description: 'Connect with your AI mentor anytime you need support. No limits on daily accountability sessions.',
      icon: CheckCircle
    },
    {
      number: '02', 
      title: 'Cross-Platform Access',
      description: 'Access your mentors from any device. Seamless experience across web, mobile, and tablet.',
      icon: Video
    },
    {
      number: '03',
      title: '24/7 AI Support',
      description: 'Your mentors are always available to provide guidance, motivation, and accountability support.',
      icon: MessageSquare
    },
    {
      number: '04',
      title: 'Advanced Analytics',
      description: 'Get detailed insights into your progress patterns and receive personalized recommendations.',
      icon: BarChart3
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column - Why You Must Use */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-6">
                Why You Must Use
                <span className="text-primary block">MentorMate?</span>
              </h2>
              <p className="font-body text-lg text-neutral-600 leading-relaxed mb-8">
                Transform your daily habits with AI-powered accountability that adapts to your unique goals, 
                schedule, and motivation style. Experience personalized mentorship that grows with you.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group font-body px-8 py-4 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-lg">
                <span>Download App</span>
              </button>
            </div>
          </div>

          {/* Right Column - Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-6 bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-primary-100 text-primary rounded-lg flex items-center justify-center font-heading font-bold text-sm">
                      {feature.number}
                    </div>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="font-body text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};