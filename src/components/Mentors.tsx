import React from 'react';
import { Dumbbell, Heart, BookOpen, Briefcase, Sparkles, ArrowRight, Users, Zap } from 'lucide-react';

const mentors = [
  {
    icon: Dumbbell,
    name: 'Coach Lex',
    category: 'Fitness',
    description: 'Motivational fitness coach who keeps you moving and celebrates every win.',
    personality: 'Energetic • Supportive • Results-focused',
    expertise: ['exercise', 'nutrition', 'strength training', 'cardio', 'recovery'],
    approach: 'Celebrates wins, pushes through challenges, focuses on progress over perfection',
    gradient: 'from-red-500 to-orange-500'
  },
  {
    icon: Heart,
    name: 'ZenKai',
    category: 'Wellness',
    description: 'Mindful wellness guide focused on balance, stress relief, and inner peace.',
    personality: 'Calm • Empathetic • Wise',
    expertise: ['mindfulness', 'stress management', 'meditation', 'work-life balance', 'mental health'],
    approach: 'Emphasizes self-compassion, mindful awareness, and gentle progression',
    gradient: 'from-blue-500 to-teal-500'
  },
  {
    icon: BookOpen,
    name: 'Prof. Ada',
    category: 'Study & Learning',
    description: 'Academic mentor who helps optimize your learning and productivity habits.',
    personality: 'Analytical • Encouraging • Strategic',
    expertise: ['productivity', 'learning techniques', 'time management', 'academic success', 'focus'],
    approach: 'Uses data and insights, breaks down complex goals, systematic approach',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Briefcase,
    name: 'No-BS Tony',
    category: 'Career & Focus',
    description: 'Direct career coach who cuts through excuses and drives real progress.',
    personality: 'Direct • Ambitious • Practical',
    expertise: ['goal setting', 'leadership', 'professional development', 'networking', 'performance'],
    approach: 'Challenges excuses, demands accountability, focuses on action over feelings',
    gradient: 'from-gray-600 to-gray-800'
  }
];

export const Mentors: React.FC = () => {
  return (
    <section id="mentors" className="py-20 bg-gradient-to-br from-primary-50 via-background to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Meet Your AI
            <span className="text-primary"> Mentor Team</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Each mentor has a unique personality, expertise, and approach to support different areas of your life. 
            Choose the one that resonates with your current goals, or switch between them as needed.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mentor.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${mentor.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <mentor.icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    {mentor.name}
                  </h3>
                  <span className="font-body text-xs font-medium text-primary bg-primary-50 px-2 py-1 rounded-full">
                    {mentor.category}
                  </span>
                </div>
                
                <p className="font-body text-neutral-600 mb-4 leading-relaxed">
                  {mentor.description}
                </p>
                
                {/* Personality */}
                <div className="mb-4">
                  <div className="font-body text-xs font-medium text-neutral-500 mb-1">
                    Personality
                  </div>
                  <div className="font-body text-sm text-neutral-700">
                    {mentor.personality}
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-4">
                  <div className="font-body text-xs font-medium text-neutral-500 mb-2">
                    Expertise
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="font-body text-xs bg-accent text-neutral-700 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="font-body text-xs text-neutral-500">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Approach */}
                <div className="border-t border-border pt-4">
                  <div className="font-body text-xs font-medium text-neutral-500 mb-1">
                    Approach
                  </div>
                  <div className="font-body text-sm text-neutral-700">
                    {mentor.approach}
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
            <span>Meet Your Mentors</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};