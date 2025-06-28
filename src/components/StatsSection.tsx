import React from 'react';
import { Users, Star, Activity } from 'lucide-react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-neutral-800 to-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 text-center text-white">
          <div className="group">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Users className="w-6 h-6 text-primary" />
              <div className="font-heading font-bold text-3xl">50,000+</div>
            </div>
            <p className="font-body text-neutral-300">People Building Better Habits</p>
          </div>
          
          <div className="group">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Star className="w-6 h-6 text-warning" />
              <div className="font-heading font-bold text-3xl">4.9/5</div>
            </div>
            <p className="font-body text-neutral-300">Average Rating from Users</p>
          </div>
          
          <div className="group">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Activity className="w-6 h-6 text-success" />
              <div className="font-heading font-bold text-3xl">2M+</div>
            </div>
            <p className="font-body text-neutral-300">Daily Check-ins Completed</p>
          </div>
        </div>
      </div>
    </section>
  );
};