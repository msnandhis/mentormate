import React, { useState } from 'react';
import { Check, Star, Crown, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for trying out AI mentorship',
    icon: Zap,
    features: [
      '3 check-ins per week',
      '1 mentor category',
      'Basic mood tracking',
      'Classic check-in mode only',
      'Weekly habit insights'
    ],
    cta: 'Start Free',
    popular: false,
    gradient: 'from-neutral-500 to-neutral-600'
  },
  {
    name: 'Premium',
    price: '$12',
    period: 'per month',
    description: 'Full access to transform your habits',
    icon: Star,
    features: [
      'Unlimited daily check-ins',
      'All 5 mentor categories',
      'Both Classic & Real-time modes',
      'Advanced AI insights',
      'Weekly mentor forecasts',
      'Priority support'
    ],
    cta: 'Start 7-Day Free Trial',
    popular: true,
    gradient: 'from-primary-500 to-primary-600'
  },
  {
    name: 'Elite',
    price: '$29',
    period: 'per month',
    description: 'Ultimate personalization with voice cloning',
    icon: Crown,
    features: [
      'Everything in Premium',
      'Custom voice mentor creation',
      'Unlimited voice samples',
      'Advanced personality tuning',
      'Early access to new features',
      'White-glove onboarding'
    ],
    cta: 'Start Elite Trial',
    popular: false,
    gradient: 'from-purple-500 to-purple-600'
  }
];

const faqData = [
  {
    question: 'How does the free trial work?',
    answer: 'Get full access to Premium features for 7 days. No credit card required. Cancel anytime during the trial with no charges.'
  },
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
  },
  {
    question: 'How does voice cloning work?',
    answer: 'Upload a 2-minute voice sample, and our AI will create a personalized mentor that sounds like you. This feature is available with the Elite plan.'
  },
  {
    question: 'What devices are supported?',
    answer: 'MentorMate works on all devices including web browsers, iOS, and Android. Your data syncs seamlessly across all platforms.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use enterprise-grade encryption and follow strict privacy protocols. Your personal data and conversations are never shared with third parties.'
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.'
  }
];

export const Pricing: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-primary-50 via-background to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Simple, Transparent
            <span className="text-primary"> Pricing</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border ${
                plan.popular 
                  ? 'border-primary shadow-2xl scale-105 lg:scale-110' 
                  : 'border-border shadow-lg hover:shadow-xl'
              } transition-all duration-300 overflow-hidden`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 bg-primary text-white text-center py-2">
                  <span className="font-body font-semibold text-sm">Most Popular</span>
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-heading font-bold text-2xl text-foreground mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="font-body text-neutral-600 mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="font-heading font-bold text-4xl text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="font-body text-neutral-600 ml-1">
                        / {plan.period}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    to="/register"
                    className={`w-full font-body px-6 py-3 rounded-lg transition-all duration-300 block text-center ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-primary-600 shadow-lg hover:shadow-xl'
                        : 'bg-background border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-primary' : 'text-success'}`} />
                      <span className="font-body text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="font-heading font-bold text-2xl text-center text-foreground mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <h4 className="font-body font-semibold text-foreground pr-4">
                    {faq.question}
                  </h4>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                  )}
                </button>
                
                {expandedFaq === index && (
                  <div className="px-6 pb-6 border-t border-border">
                    <p className="font-body text-neutral-600 pt-4 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};