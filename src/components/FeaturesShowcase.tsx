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
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        {/* Section Header with improved spacing */}
        <div className="text-center mb-24">
          <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
            Powerful Features for
            <span className="text-primary block mt-2"> Lasting Change</span>
          </h2>
          <p className="font-body text-xl sm:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
            Experience the future of personal development with AI mentors that understand your unique 
            journey and adapt to your lifestyle.
          </p>
        </div>

        {/* Features Grid with enhanced spacing */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative bg-white rounded-3xl p-8 lg:p-10 border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-2xl flex items-center justify-center font-heading font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.number}
                    </div>
                    <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="font-heading font-bold text-xl lg:text-2xl text-foreground mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="font-body text-neutral-600 leading-relaxed text-base lg:text-lg">
                    {feature.description}
                  </p>

                  {/* Enhanced decorative element */}
                  <div className="mt-6 flex items-center space-x-3">
                    <div className={`w-12 h-1 bg-gradient-to-r ${feature.color} rounded-full`} />
                    <div className="w-3 h-3 bg-primary rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-24">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-50 to-primary-100 text-primary px-8 py-4 rounded-full border border-primary-200 hover:shadow-lg transition-all duration-300">
            <span className="font-body font-semibold text-lg">Ready to transform your habits?</span>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};