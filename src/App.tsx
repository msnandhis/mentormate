import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Mentors } from './components/Mentors';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { EnhancedOnboardingFlow } from './components/onboarding/EnhancedOnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { CustomMentorCreation } from './components/mentors/CustomMentorCreation';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={openAuthModal} />
      <main>
        <Hero onOpenAuth={openAuthModal} />
        <Features />
        <Mentors />
        <Testimonials />
        <Pricing onOpenAuth={openAuthModal} />
      </main>
      <Footer />
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="font-body text-lg text-neutral-600">Loading MentorMate...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  if (!user) {
    return <LandingPage />;
  }

  // Authenticated but onboarding not completed - show enhanced onboarding
  if (!profile?.onboarding_completed) {
    return <EnhancedOnboardingFlow />;
  }

  // Authenticated and onboarded - show app with header
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16"> {/* Account for fixed header */}
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireOnboarding>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requireOnboarding>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-mentor" 
            element={
              <ProtectedRoute requireOnboarding>
                <CustomMentorCreation />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;