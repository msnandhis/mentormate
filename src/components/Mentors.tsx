import React from 'react';
import { Dumbbell, Heart, BookOpen, Briefcase, Sparkles, ArrowRight, Users, Zap, CheckCircle, Target, Brain, MessageSquare } from 'lucide-react';

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

const whyFeatures = [
  {
    number: '01',
    title: 'AI-Powered Personalization',
    description: 'Each mentor adapts to your unique goals, personality, and progress patterns for truly personalized guidance.',
    icon: Brain
  },
  {
    number: '02',
    title: 'Daily Video Responses',
    description: 'Get personalized video messages from your AI mentor based on your daily check-ins and mood.',
    icon: MessageSquare
  },
  {
    number: '03',
    title: 'Real-Time Conversations',
    description: 'Have live video conversations with your AI mentor when you need immediate support and motivation.',
    icon: Users
  },
  {
    number: '04',
    title: 'Multiple Mentor Types',
    description: 'Choose from fitness, wellness, study, and career mentors, or create your own with voice cloning.',
    icon: Target
  }
];

const howItWorks = [
  {
    step: '01',
    title: 'Choose Your Mentor',
    description: 'Select from our specialized AI mentors or create a custom one with your own voice.',
    image: '/api/placeholder/300/200'
  },
  {
    step: '02',
    title: 'Daily Check-ins',
    description: 'Complete quick 2-minute check-ins about your mood, goals, and progress.',
    image: '/api/placeholder/300/200'
  },
  {
    step: '03',
    title: 'Get Personalized Videos',
    description: 'Receive custom video responses with encouragement, insights, and next steps.',
    image: '/api/placeholder/300/200'
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

        {/* Why You Must Use MentorMate Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-border shadow-lg mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-heading font-bold text-3xl text-foreground mb-6">
                Why You Must Use
                <span className="text-primary block">MentorMate?</span>
              </h3>
              <p className="font-body text-lg text-neutral-600 mb-8 leading-relaxed">
                Traditional accountability methods fail because they lack personalization and consistency. 
                MentorMate combines AI technology with proven psychology to create the perfect accountability partner.
              </p>
              
              <div className="space-y-6">
                {whyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-heading font-bold text-primary text-lg">
                          {feature.number}
                        </span>
                        <h4 className="font-heading font-semibold text-lg text-foreground">
                          {feature.title}
                        </h4>
                      </div>
                      <p className="font-body text-neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-xl">
                {/* Mock Video Interface */}
                <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="font-heading font-bold text-white">AI</span>
                    </div>
                    <div>
                      <div className="font-body font-semibold text-foreground">ZenKai</div>
                      <div className="font-body text-sm text-neutral-600">Wellness Mentor</div>
                    </div>
                    <div className="ml-auto w-3 h-3 bg-success rounded-full animate-pulse" />
                  </div>
                  
                  {/* Mock Video */}
                  <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-4 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  {/* Mock Message */}
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="font-body text-sm text-primary-800">
                      "I noticed you've been consistent with meditation this week! Your mood scores show real improvement. Let's build on this momentum..."
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="font-heading font-bold text-2xl text-primary">95%</div>
                    <div className="font-body text-xs text-primary-700">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-heading font-bold text-2xl text-primary">7</div>
                    <div className="font-body text-xs text-primary-700">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-heading font-bold text-2xl text-primary">8.5</div>
                    <div className="font-body text-xs text-primary-700">Avg Mood</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="font-body text-xs font-medium">Goal achieved!</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg animate-pulse-slow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="font-body text-xs font-medium">Streak bonus!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How MentorMate Works Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="font-heading font-bold text-3xl text-foreground mb-4">
              How MentorMate
              <span className="text-primary"> Works?</span>
            </h3>
            <p className="font-body text-lg text-neutral-600 max-w-2xl mx-auto">
              Simple steps to transform your habits with AI-powered accountability that adapts to your lifestyle.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6">
                    <span className="font-heading font-bold text-white text-xl">
                      {step.step}
                    </span>
                  </div>

                  {/* Mock Interface */}
                  <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg p-6 mb-6 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        {index === 0 && <Users className="w-6 h-6 text-primary" />}
                        {index === 1 && <Target className="w-6 h-6 text-primary" />}
                        {index === 2 && <MessageSquare className="w-6 h-6 text-primary" />}
                      </div>
                      <div className="font-body text-sm text-neutral-600">
                        {index === 0 && 'Select Mentor'}
                        {index === 1 && 'Track Progress'}
                        {index === 2 && 'Get Guidance'}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-heading font-bold text-xl text-foreground mb-3">
                    {step.title}
                  </h4>
                  <p className="font-body text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Arrow */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="group font-body px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
            <span>Start Your Journey Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};