import React from 'react';
import { ArrowRight, CheckCircle, Video, MessageSquare, Brain, BarChart3, Download, Smartphone } from 'lucide-react';

export const FeaturesShowcase: React.FC = () => {
  const features = [
    {
      number: '01',
      title: 'Unlimited Check-ins',
      description: 'Connect with your AI mentor anytime you need support. No daily limits or restrictions.',
      icon: CheckCircle,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '02', 
      title: 'Available On All Devices',
      description: 'Access your mentors from anywhere. Seamless experience across web, mobile, and tablet.',
      icon: Smartphone,
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: '03',
      title: '24/7 AI Support',
      description: 'Your mentors are always available to provide guidance and accountability support.',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600'
    },
    {
      number: '04',
      title: 'Get Insights Every Week',
      description: 'Receive detailed analytics and personalized recommendations to optimize your progress.',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Why You Must Use */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-6">
                Why You Must Use
                <span className="text-primary block">MentorMate?</span>
              </h2>
              <p className="font-body text-lg text-neutral-600 leading-relaxed mb-8">
                Experience the future of personal development with AI mentors that understand your unique 
                journey. Build lasting habits with accountability that adapts to your lifestyle and goals.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                <Download className="w-5 h-5" />
                <span>Download App</span>
              </button>
              
              <button className="group font-body px-8 py-4 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-lg">
                <Smartphone className="w-5 h-5" />
                <span>Start Free Trial</span>
              </button>
            </div>
          </div>

          {/* Right Column - Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative bg-white rounded-2xl p-6 border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} text-white rounded-xl flex items-center justify-center font-heading font-bold text-sm shadow-lg`}>
                        {feature.number}
                      </div>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <h3 className="font-heading font-bold text-lg text-foreground mb-3 leading-tight">
                      {feature.title}
                    </h3>
                    
                    <p className="font-body text-neutral-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>

                    {/* Decorative element */}
                    <div className="mt-4 flex items-center space-x-2">
                      <div className={`w-8 h-0.5 bg-gradient-to-r ${feature.color} rounded-full`} />
                      <div className="w-2 h-2 bg-primary rounded-full opacity-60" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};