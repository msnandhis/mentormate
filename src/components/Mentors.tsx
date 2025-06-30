import React from 'react';
import { Dumbbell, Heart, BookOpen, Briefcase, Sparkles, ArrowRight, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const mentors = [
  {
    icon: Dumbbell,
    name: 'Coach Lex',
    category: 'Fitness',
    description: 'Motivational fitness coach who keeps you moving and celebrates every win.',
    personality: 'Energetic • Supportive • Results-focused',
    expertise: ['exercise', 'nutrition', 'strength training', 'cardio', 'recovery'],
    approach: 'Celebrates wins, pushes through challenges, focuses on progress over perfection',
    gradient: 'from-red-500 to-orange-500',
    image: '/Coach%20Lex.png'
  },
  {
    icon: Heart,
    name: 'ZenKai',
    category: 'Wellness',
    description: 'Mindful wellness guide focused on balance, stress relief, and inner peace.',
    personality: 'Calm • Empathetic • Wise',
    expertise: ['mindfulness', 'stress management', 'meditation', 'work-life balance', 'mental health'],
    approach: 'Emphasizes self-compassion, mindful awareness, and gentle progression',
    gradient: 'from-blue-500 to-teal-500',
    image: '/ZenKai.png'
  },
  {
    icon: BookOpen,
    name: 'Prof. Sophia',
    category: 'Study & Learning',
    description: 'Academic mentor who helps optimize your learning and productivity habits.',
    personality: 'Analytical • Encouraging • Strategic',
    expertise: ['productivity', 'learning techniques', 'time management', 'academic success', 'focus'],
    approach: 'Uses data and insights, breaks down complex goals, systematic approach',
    gradient: 'from-purple-500 to-pink-500',
    image: '/Prof%20Sophia.png'
  },
  {
    icon: Briefcase,
    name: 'Dr. Maya',
    category: 'Career & Focus',
    description: 'Insightful career mentor who combines strategic guidance with empathetic understanding.',
    personality: 'Insightful • Strategic • Empathetic',
    expertise: ['leadership', 'career planning', 'professional development', 'networking', 'performance'],
    approach: 'Balances professional advancement with personal values alignment',
    gradient: 'from-gray-600 to-gray-800',
    image: '/Dr%20Maya.png'
  }
];

export const Mentors: React.FC = () => {
  return (
    <section id="mentors" className="py-24 bg-gradient-to-br from-primary-50 via-background to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-4xl text-foreground mb-6">
            Meet Your AI
            <span className="text-primary"> Mentor Team</span>
          </h2>
          <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
            Each mentor has a unique personality, expertise, and approach to support different areas of your life. 
            Choose the one that resonates with your current goals, or switch between them as needed.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid lg:grid-cols-4 gap-8 mb-20">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Mentor Image */}
              <div className="h-64 overflow-hidden">
                <img 
                  src={mentor.image} 
                  alt={mentor.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-all duration-700"
                />
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Header with Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    {mentor.name}
                  </h3>
                  <span className="font-body text-xs font-medium text-primary bg-primary-50 px-3 py-1.5 rounded-full capitalize">
                    {mentor.category}
                  </span>
                </div>
                
                <p className="font-body text-neutral-600 mb-4 leading-relaxed">
                  {mentor.description}
                </p>
                
                {/* Expertise */}
                <div className="mb-4">
                  <div className="font-body text-xs font-medium text-neutral-500 mb-2">
                    Expertise
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="font-body text-xs bg-accent text-neutral-700 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="font-body text-xs text-neutral-500 self-center">
                        +{mentor.expertise.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Personality */}
                <div className="border-t border-border pt-4 pl-1">
                  <div className="font-body text-xs font-medium text-neutral-500 mb-2">
                    Approach
                  </div>
                  <p className="font-body text-sm text-neutral-700">
                    {mentor.approach}
                  </p>
                </div>
              </div>
              
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
              
              {/* Call-to-action on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <Link 
                  to="/register" 
                  className="w-full bg-white text-primary font-body font-medium rounded-lg py-2 flex items-center justify-center space-x-2"
                >
                  <span>Meet {mentor.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/register"
            className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <span>Meet Your Mentors</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};