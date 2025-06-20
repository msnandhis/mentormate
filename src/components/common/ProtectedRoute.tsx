import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false 
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="font-body text-lg text-neutral-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the main App component
  }

  if (requireOnboarding && !profile?.onboarding_completed) {
    return null; // This will be handled by the main App component
  }

  return <>{children}</>;
};