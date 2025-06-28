import React from 'react';
import { CheckCircle, Smartphone, MessageSquare, BarChart3 } from 'lucide-react';

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
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Powerful Features for
            <span className="text-primary"> Lasting Change</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Experience the future of personal development with AI mentors that understand your unique 
            journey and adapt to your lifestyle.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative bg-white rounded-2xl p-6 border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} text-white rounded-xl flex items-center justify-center font-heading font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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