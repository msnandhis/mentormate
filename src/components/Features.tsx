import React from 'react';
import { Video, MessageSquare, Brain, BarChart3, Clock, Mic } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'AI Video Mentors',
    description: 'Get personalized video responses from AI mentors who adapt to your unique goals and preferences.',
    bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
    iconColor: 'bg-blue-500',
    textColor: 'text-blue-900'
  },
  {
    icon: MessageSquare,
    title: 'Live Conversations',
    description: 'Have real-time video conversations with your mentor whenever you need deeper guidance.',
    bgColor: 'bg-gradient-to-br from-pink-100 to-pink-200',
    iconColor: 'bg-pink-500',
    textColor: 'text-pink-900'
  },
  {
    icon: Brain,
    title: 'Smart Analytics',
    description: 'Track your progress with detailed insights and visualizations of your habit development.',
    bgColor: 'bg-gradient-to-br from-green-100 to-teal-100',
    iconColor: 'bg-green-500',
    textColor: 'text-green-900'
  },
  {
    icon: BarChart3,
    title: 'AI Insights',
    description: 'Get weekly forecasts and pattern analysis to understand your habits and optimize your progress.',
    bgColor: 'bg-gradient-to-br from-orange-100 to-red-100',
    iconColor: 'bg-red-500',
    textColor: 'text-red-900'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Check in when it works for you - morning, noon, or night. Your mentor adapts to your schedule.',
    bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    iconColor: 'bg-blue-500',
    textColor: 'text-blue-900'
  },
  {
    icon: Mic,
    title: 'Voice Cloning',
    description: 'Create a custom mentor with your own voice for the ultimate personalized experience.',
    bgColor: 'bg-gradient-to-br from-green-100 to-teal-100',
    iconColor: 'bg-teal-500',
    textColor: 'text-teal-900'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid - Masonry-style layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = index === 0 || index === 4; // First and fifth cards are larger
            
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isLarge ? 'md:col-span-1 lg:row-span-2' : ''
                } ${feature.bgColor}`}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${feature.iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Text Content */}
                  <h3 className={`font-heading font-bold text-2xl ${feature.textColor} mb-4 leading-tight`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`font-body leading-relaxed ${feature.textColor.replace('900', '700')} ${
                    isLarge ? 'text-lg' : 'text-base'
                  }`}>
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="mt-6 flex items-center space-x-2 opacity-60">
                    <div className={`w-2 h-2 ${feature.iconColor} rounded-full`} />
                    <div className={`w-8 h-0.5 ${feature.iconColor} rounded-full`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary px-6 py-3 rounded-full">
            <span className="font-body font-medium">Ready to transform your habits?</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};