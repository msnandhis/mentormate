import React from 'react';
import { Clock, Brain, Zap } from 'lucide-react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-neutral-800 to-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 text-center text-white">
          <div className="group">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Clock className="w-6 h-6 text-primary" />
              <div className="font-heading font-bold text-3xl">24/7</div>
            </div>
            <p className="font-body text-neutral-300">AI Mentor Availability</p>
            <p className="font-body text-xs text-neutral-400 mt-1">Always here when you need support</p>
          </div>
          
          <div className="group">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Brain className="w-6 h-6 text-warning" />
              <div className="font-heading font-bold text-3xl">4 Types</div>
            </div>
            <p className="font-body text-neutral-300">Specialized AI Mentors</p>
            <p className="font-body text-xs text-neutral-400 mt-1">Fitness, wellness, study & career coaches</p>
          </div>
          
          <div className="group">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Zap className="w-6 h-6 text-success" />
              <div className="font-heading font-bold text-3xl">21 Days</div>
            </div>
            <p className="font-body text-neutral-300">Average Habit Formation</p>
            <p className="font-body text-xs text-neutral-400 mt-1">Science-backed approach to lasting change</p>
          </div>
        </div>
      </div>
    </section>
  );
};