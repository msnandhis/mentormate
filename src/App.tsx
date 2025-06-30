import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { FeaturesShowcase } from './components/FeaturesShowcase';
import { Mentors } from './components/Mentors';
import { HowItWorks } from './components/HowItWorks';
import { StatsSection } from './components/StatsSection';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { EnhancedOnboardingFlow } from './components/onboarding/EnhancedOnboardingFlow';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { CustomMentorCreation } from './components/mentors/CustomMentorCreation';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Import new pages
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TermsPage } from './components/pages/TermsPage';

// ScrollToTop component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeaturesShowcase />
        <HowItWorks />
        <StatsSection />
        <Mentors />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
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

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            {/* Onboarding check */}
            {!profile?.onboarding_completed ? (
              <Route path="*" element={<EnhancedOnboardingFlow />} />
            ) : (
              <>
                {/* Authenticated app routes */}
                <Route path="/" element={
                  <ProtectedRoute requireOnboarding>
                    <div className="min-h-screen">
                      <Header />
                      <div className="pt-16">
                        <Dashboard />
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute requireOnboarding>
                    <div className="min-h-screen">
                      <Header />
                      <div className="pt-16">
                        <ProfileSettings />
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/create-mentor" element={
                  <ProtectedRoute requireOnboarding>
                    <div className="min-h-screen">
                      <Header />
                      <div className="pt-16">
                        <CustomMentorCreation />
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Public landing page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
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