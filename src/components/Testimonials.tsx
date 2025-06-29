import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, MessageSquare } from 'lucide-react';

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
    text: "Dr. Maya's strategic approach helped me prioritize my career goals. Her insights on leadership development have been transformative.",
    rating: 5,
    mentor: 'Dr. Maya'
  },
  {
    name: 'Emily Watson',
    role: 'Graduate Student',
    avatar: 'EW',
    text: 'Prof. Sophia has been incredible for staying on top of my thesis. Her study strategies and accountability have made all the difference.',
    rating: 5,
    mentor: 'Prof. Sophia'
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
    mentor: 'Prof. Sophia'
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-4xl text-foreground mb-6">
            Loved by
            <span className="text-primary"> Thousands</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Real stories from people who've transformed their habits with AI mentorship.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-border hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-200 opacity-50 group-hover:opacity-100 transition-opacity" />
              
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
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
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
                <div className="font-body text-xs font-medium text-primary bg-primary-50 px-3 py-1.5 rounded-full flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{testimonial.mentor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Carousel - Second Row */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {testimonials.slice(3, 6).map((testimonial, index) => (
            <div
              key={index + 3}
              className="bg-white rounded-xl p-8 border border-border hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-200 opacity-50 group-hover:opacity-100 transition-opacity" />
              
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
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
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
                <div className="font-body text-xs font-medium text-primary bg-primary-50 px-3 py-1.5 rounded-full flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{testimonial.mentor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Link
            to="/register"
            className="inline-block font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
};