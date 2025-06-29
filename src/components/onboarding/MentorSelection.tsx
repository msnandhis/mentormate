import React from 'react';
import { Dumbbell, Heart, BookOpen, Briefcase, Info } from 'lucide-react';
import { Mentor } from '../../lib/supabase';
import { MentorCard } from '../mentors/MentorCard';

interface MentorSelectionProps {
  mentors: Mentor[];
  selectedMentor: Mentor | null;
  onSelectMentor: (mentor: Mentor) => void;
}

export const MentorSelection: React.FC<MentorSelectionProps> = ({
  mentors,
  selectedMentor,
  onSelectMentor,
}) => {
  const regularMentors = mentors.filter(mentor => !mentor.is_custom);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
          Choose Your AI Mentor
        </h2>
        <p className="font-body text-lg text-neutral-600">
          Each mentor has a unique personality and expertise to support different areas of your life.
        </p>
      </div>

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {regularMentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            selected={selectedMentor?.id === mentor.id}
            onSelect={onSelectMentor}
            size="large"
          />
        ))}
      </div>

      {/* Info Box */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-blue-800 mb-2">
              How Mentors Work
            </h3>
            <ul className="font-body text-blue-700 space-y-1">
              <li>• Each mentor has specialized knowledge and a unique personality</li>
              <li>• You can switch mentors anytime or use different ones for different goals</li>
              <li>• All mentors use AI to provide personalized guidance and accountability</li>
              <li>• Your chosen mentor will be your default, but you can change this later</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Mentor Preview */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <h3 className="font-heading font-semibold text-lg text-purple-800 mb-2">
          Want a Custom Mentor?
        </h3>
        <p className="font-body text-purple-700 mb-4">
          You can create a personalized mentor with your own voice after completing the basic setup. 
          This feature is available with our Premium and Elite plans.
        </p>
        <div className="inline-flex items-center space-x-2 text-purple-600 font-body text-sm">
          <span>Available after onboarding</span>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};