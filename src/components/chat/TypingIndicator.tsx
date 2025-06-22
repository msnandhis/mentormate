import React from 'react';

interface TypingIndicatorProps {
  mentorName?: string;
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  mentorName = 'Mentor', 
  visible 
}) => {
  if (!visible) return null;

  return (
    <div className="flex items-start space-x-3 p-4 animate-slide-up">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <span className="font-heading font-bold text-white text-sm">
          {mentorName.charAt(0)}
        </span>
      </div>
      
      <div className="bg-accent rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="font-body text-sm text-neutral-600 ml-2">
            {mentorName} is thinking...
          </span>
        </div>
      </div>
    </div>
  );
};