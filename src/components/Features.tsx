import React from 'react';
import { Video, MessageSquare, Brain, BarChart3, Clock, Mic } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Daily Video Check-ins',
    description: 'Personal video messages from your AI mentor based on your mood, goals, and progress.',
    color: 'bg-primary-100 text-primary-700'
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Conversations',
    description: 'Have live video conversations with your AI mentor for deeper support and guidance.',
    color: 'bg-info-100 text-info-700'
  },
  {
    icon: Brain,
    title: 'Multiple Mentor Types',
    description: 'Choose from fitness coaches, wellness guides, productivity experts, and more specialized mentors.',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    icon: Mic,
    title: 'Voice Cloning',
    description: 'Create a custom mentor with your own voice for the ultimate personalized experience.',
    color: 'bg-orange-100 text-orange-700'
  },
  {
    icon: BarChart3,
    title: 'AI Insights',
    description: 'Get weekly forecasts and pattern analysis to understand your habits and optimize your progress.',
    color: 'bg-success-100 text-success-700'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Check in when it works for you - morning, noon, or night. Your mentor adapts to your schedule.',
    color: 'bg-warning-100 text-warning-700'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Powerful Features for
            <span className="text-primary"> Lasting Change</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Our AI-powered platform combines the best of technology and human psychology 
            to create accountability that actually works.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="font-body text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
};