import React from 'react';
import { Dumbbell, Heart, BookOpen, Briefcase, Sparkles, User, Check } from 'lucide-react';
import { Mentor } from '../../lib/supabase';

interface MentorCardProps {
  mentor: Mentor;
  selected?: boolean;
  onSelect?: (mentor: Mentor) => void;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const mentorIcons = {
  fitness: Dumbbell,
  wellness: Heart,
  study: BookOpen,
  career: Briefcase,
  custom: Sparkles,
};

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  selected = false,
  onSelect,
  showDetails = true,
  size = 'medium',
}) => {
  const Icon = mentorIcons[mentor.category as keyof typeof mentorIcons] || User;
  
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16',
  };

  const iconInnerSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div
      onClick={() => onSelect?.(mentor)}
      className={`
        relative bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${selected 
          ? 'border-primary bg-primary-50 shadow-lg scale-105' 
          : 'border-border hover:border-primary-200 hover:shadow-lg'
        }
        ${sizeClasses[size]}
        ${onSelect ? 'hover:-translate-y-1' : ''}
      `}
    >
      {/* Selection Check */}
      {selected && onSelect && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Mentor Icon */}
      <div className={`${iconSizes[size]} bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`${iconInnerSizes[size]} text-white`} />
      </div>

      {/* Mentor Info */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-heading font-bold text-foreground ${
            size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-xl'
          }`}>
            {mentor.name}
          </h3>
          <span className={`font-body font-medium text-primary bg-primary-100 px-2 py-1 rounded-full capitalize ${
            size === 'small' ? 'text-xs' : 'text-xs'
          }`}>
            {mentor.category}
          </span>
        </div>

        {showDetails && (
          <>
            <p className={`font-body text-neutral-600 mb-3 leading-relaxed ${
              size === 'small' ? 'text-xs' : 'text-sm'
            }`}>
              {mentor.description}
            </p>

            {mentor.personality && (
              <div className="border-t border-border pt-3">
                <div className={`font-body font-medium text-neutral-500 mb-1 ${
                  size === 'small' ? 'text-xs' : 'text-xs'
                }`}>
                  Personality
                </div>
                <div className={`font-body text-neutral-700 ${
                  size === 'small' ? 'text-xs' : 'text-sm'
                }`}>
                  {mentor.personality}
                </div>
              </div>
            )}

            {mentor.expertise && mentor.expertise.length > 0 && (
              <div className="mt-3">
                <div className={`font-body font-medium text-neutral-500 mb-2 ${
                  size === 'small' ? 'text-xs' : 'text-xs'
                }`}>
                  Expertise
                </div>
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className={`font-body bg-accent text-neutral-700 px-2 py-1 rounded-full ${
                        size === 'small' ? 'text-xs' : 'text-xs'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {mentor.expertise.length > 3 && (
                    <span className={`font-body text-neutral-500 ${
                      size === 'small' ? 'text-xs' : 'text-xs'
                    }`}>
                      +{mentor.expertise.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute bottom-4 right-4 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
    </div>
  );
};