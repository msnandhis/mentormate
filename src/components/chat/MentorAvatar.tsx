import React from 'react';
import { Dumbbell, Heart, BookOpen, Briefcase, Sparkles, User } from 'lucide-react';
import { Mentor } from '../../lib/supabase';

interface MentorAvatarProps {
  mentor: Mentor;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  isActive?: boolean;
}

const mentorIcons = {
  fitness: Dumbbell,
  wellness: Heart,
  study: BookOpen,
  career: Briefcase,
  custom: Sparkles,
};

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  mentor,
  size = 'medium',
  showStatus = false,
  isActive = false,
}) => {
  const Icon = mentorIcons[mentor.category as keyof typeof mentorIcons] || User;
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className="relative">
      <div className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'} 
        rounded-full flex items-center justify-center
        ${isActive ? 'ring-2 ring-white ring-offset-2' : ''}
      `}>
        <Icon className={`${iconSizes[size]} text-white`} />
      </div>
      
      {showStatus && (
        <div className={`
          absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
          ${isActive ? 'bg-success' : 'bg-neutral-400'}
        `} />
      )}
    </div>
  );
};