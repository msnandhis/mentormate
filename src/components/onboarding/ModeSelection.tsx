import React from 'react';
import { MessageSquare, Video, Clock, Zap } from 'lucide-react';

interface ModeSelectionProps {
  selectedMode: 'classic' | 'realtime';
  onSelectMode: (mode: 'classic' | 'realtime') => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes = [
    {
      id: 'classic' as const,
      name: 'Classic Check-in',
      icon: MessageSquare,
      description: 'Quick daily form + personalized video response from your AI mentor',
      features: [
        '2-minute daily check-in',
        'Mood tracking & goal updates',
        'Personalized video messages',
        'Perfect for busy schedules',
      ],
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'blue-200',
      textColor: 'blue-700',
    },
    {
      id: 'realtime' as const,
      name: 'Real-Time Chat',
      icon: Video,
      description: 'Live video conversations with your AI mentor for deeper support',
      features: [
        'Live video conversations',
        'Voice-to-voice interaction',
        'Immediate feedback & support',
        'When you need extra motivation',
      ],
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'purple-200',
      textColor: 'purple-700',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
          Choose Your Check-in Style
        </h2>
        <p className="font-body text-lg text-neutral-600">
          Select how you'd like to interact with your AI mentor. You can always change this later.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <div
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                isSelected
                  ? `border-${mode.borderColor.split('-')[0]}-400 bg-gradient-to-br ${mode.bgGradient} shadow-lg scale-105`
                  : 'border-border bg-white hover:shadow-lg hover:border-primary-200'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${mode.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${mode.gradient} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className={`font-heading font-bold text-xl mb-3 ${
                isSelected ? mode.textColor : 'text-foreground'
              }`}>
                {mode.name}
              </h3>

              <p className={`font-body mb-6 leading-relaxed ${
                isSelected ? mode.textColor : 'text-neutral-600'
              }`}>
                {mode.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {mode.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 bg-gradient-to-br ${mode.gradient} rounded-full flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className={`font-body text-sm ${
                      isSelected ? mode.textColor : 'text-neutral-600'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Time Indicator */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${isSelected ? mode.textColor : 'text-neutral-500'}`} />
                  <span className={`font-body text-sm ${
                    isSelected ? mode.textColor : 'text-neutral-500'
                  }`}>
                    {mode.id === 'classic' ? '2-5 minutes daily' : '5-15 minutes as needed'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-accent rounded-xl border border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-primary-800 mb-2">
              Flexible by Design
            </h3>
            <p className="font-body text-primary-700">
              You can switch between modes anytime in your settings. Many users start with Classic 
              check-ins and use Real-time chat when they need extra support or motivation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};