import React from 'react';
import { ArrowRight, Star, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4" />
              <span className="font-body text-sm font-medium">AI-Powered Daily Accountability</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-bold text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              One App for<br />
              <span className="text-primary">Every Goal</span>
            </h1>

            {/* Subheadline */}
            <p className="font-body text-xl text-neutral-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Transform your habits with personalized AI mentors who understand your goals, 
              track your progress, and keep you motivated every step of the way.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link 
                to="/register"
                className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Zap className="w-5 h-5" />
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/8867433/pexels-photo-8867433.jpeg" 
              alt="Person working with AI assistant" 
              className="rounded-2xl shadow-2xl"
            />

            {/* Floating Elements */}
            <div className="absolute -top-4 right-8 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="font-body text-xs font-medium text-foreground">Live AI Support</span>
              </div>
            </div>

            <div className="absolute -bottom-4 left-8 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-body text-xs font-medium text-foreground">50k+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};