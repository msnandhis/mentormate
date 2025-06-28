import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    avatar: 'SC',
    text: 'MentorMate completely changed my morning routine. Having Coach Lex check in with me daily has kept me consistent with workouts for the first time in years.',
    rating: 5,
    mentor: 'Coach Lex'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Entrepreneur',
    avatar: 'MR',
    text: "No-BS Tony doesn't let me make excuses. The direct feedback and weekly forecasts have helped me finally launch my side project.",
    rating: 5,
    mentor: 'No-BS Tony'
  },
  {
    name: 'Emily Watson',
    role: 'Graduate Student',
    avatar: 'EW',
    text: 'Prof. Ada has been incredible for staying on top of my thesis. The study sessions and accountability have made all the difference.',
    rating: 5,
    mentor: 'Prof. Ada'
  },
  {
    name: 'David Kim',
    role: 'Designer',
    avatar: 'DK',
    text: 'ZenKai helps me start each day with intention. The wellness check-ins have significantly reduced my stress and improved my focus.',
    rating: 5,
    mentor: 'ZenKai'
  },
  {
    name: 'Lisa Thompson',
    role: 'Marketing Director',
    avatar: 'LT',
    text: 'Creating my own voice mentor was amazing. It feels like having a personal coach who truly understands me and my goals.',
    rating: 5,
    mentor: 'Custom Voice'
  },
  {
    name: 'Alex Chen',
    role: 'Software Engineer',
    avatar: 'AC',
    text: 'The AI insights showed me patterns I never noticed. Now I know exactly when I\'m most productive and plan accordingly.',
    rating: 5,
    mentor: 'Prof. Ada'
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Loved by
            <span className="text-primary"> Thousands</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Real stories from people who've transformed their habits with AI mentorship.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-primary-200 mb-4" />
              
              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="font-body text-neutral-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="font-heading font-semibold text-white text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-body font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="font-body text-sm text-neutral-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Mentor Badge */}
                <div className="font-body text-xs font-medium text-primary bg-primary-50 px-2 py-1 rounded-full">
                  {testimonial.mentor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};