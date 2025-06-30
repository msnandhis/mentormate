import React from 'react';
import { CheckCircle, Smartphone, MessageSquare, BarChart3, Video, Brain, Heart, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesShowcase: React.FC = () => {
  const features = [
    {
      number: '01',
      title: 'AI Video Mentors',
      description: 'Get personalized video responses from AI mentors who adapt to your unique goals and preferences.',
      icon: Video,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '02', 
      title: 'Live Conversations',
      description: 'Have real-time video conversations with your mentor whenever you need deeper guidance.',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: '03',
      title: 'Smart Analytics',
      description: 'Track your progress with detailed insights and visualizations of your habit development.',
      icon: BarChart3,
      color: 'from-green-500 to-green-600'
    },
    {
      number: '04',
      title: 'Personalized Mentors',
      description: 'Choose from specialized mentors for fitness, wellness, learning, and career development.',
      icon: Brain,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-6 leading-tight">
            Powerful Features for
            <span className="text-primary block mt-2"> Lasting Change</span>
          </h2>
          <p className="font-body text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
            Our AI-powered platform combines cutting-edge technology with behavioral science to create 
            accountability that transforms habits and delivers real results.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative bg-white rounded-3xl p-8 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Subtle background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-2 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-2xl flex items-center justify-center font-heading font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      {feature.number}
                    </div>
                    <Icon className="w-8 h-8 text-primary group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="font-heading font-bold text-xl lg:text-2xl text-foreground mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="font-body text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="mt-6 flex items-center space-x-3">
                    <div className={`w-12 h-1 bg-gradient-to-r ${feature.color} rounded-full`} />
                    <div className="w-3 h-3 bg-primary rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/register" className="inline-block font-body px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
            Explore All Features
          </Link>
        </div>
      </div>
    </section>
  );
};