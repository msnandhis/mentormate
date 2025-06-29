import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user && !data.session) {
        setError('Please check your email to confirm your account');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: password.length >= 6 },
    { text: 'Contains letters', met: /[a-zA-Z]/.test(password) },
    { text: 'Passwords match', met: password === confirmPassword && password.length > 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2 text-neutral-600 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-body">Back to Home</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/50">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                MentorMate
              </span>
            </div>
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
              Create Your Account
            </h1>
            <p className="font-body text-neutral-600">
              Start your journey with AI-powered mentorship
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="p-4 bg-accent rounded-lg">
                <p className="font-body text-sm font-medium text-neutral-700 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle 
                        className={`w-4 h-4 ${req.met ? 'text-success' : 'text-neutral-300'}`} 
                      />
                      <span className={`font-body text-xs ${req.met ? 'text-success' : 'text-neutral-500'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary bg-white border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="agreeToTerms" className="font-body text-sm text-neutral-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:text-primary-600 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-body font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {loading ? 'Creating Account...' : 'Create Account'}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white font-body text-neutral-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-body font-medium text-primary hover:text-primary-600 transition-colors"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/50">
          <div className="text-center mb-4">
            <h3 className="font-heading font-semibold text-foreground mb-2">
              What you'll get with MentorMate:
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="font-body text-xs text-neutral-600">AI Mentors</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="font-body text-xs text-neutral-600">Daily Check-ins</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="font-body text-xs text-neutral-600">Progress Tracking</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="font-body text-xs text-neutral-600">Free Trial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};