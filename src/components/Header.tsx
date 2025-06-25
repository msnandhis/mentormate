import React, { useState } from 'react';
import { Menu, X, MessageCircle, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              MentorMate
            </span>
          </div>

          {/* Navigation - Only show on landing page */}
          {!user && (
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#mentors" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Mentors
              </a>
              <a href="#pricing" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Reviews
              </a>
            </nav>
          )}

          {/* Auth Buttons or User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="font-heading font-semibold text-white text-sm">
                    {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block font-body text-foreground">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-border py-2">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="font-body font-medium text-foreground">
                      {profile?.full_name || 'User'}
                    </div>
                    <div className="font-body text-sm text-neutral-600">
                      {user.email}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/profile';
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 font-body text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-2 font-body text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={() => onOpenAuth?.('signin')}
                className="font-body px-4 py-2 text-neutral-600 hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => onOpenAuth?.('signup')}
                className="font-body px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && !user && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#mentors" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Mentors
              </a>
              <a href="#pricing" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="font-body text-neutral-600 hover:text-primary transition-colors">
                Reviews
              </a>
              <div className="pt-4 space-y-2">
                <button 
                  onClick={() => onOpenAuth?.('signin')}
                  className="w-full font-body px-4 py-2 text-neutral-600 hover:text-primary transition-colors text-left"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onOpenAuth?.('signup')}
                  className="w-full font-body px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Start Free Trial
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};