import React from 'react';
import { Clock, Brain, Zap } from 'lucide-react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-neutral-800 to-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-700/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-3xl text-white">24/7</div>
                <p className="font-body text-neutral-300">AI Mentor Availability</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-700/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-3xl text-white">4 Types</div>
                <p className="font-body text-neutral-300">Specialized AI Mentors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-700/30 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-3xl text-white">21 Days</div>
                <p className="font-body text-neutral-300">Average Habit Formation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};