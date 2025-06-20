import React, { useState, useEffect } from 'react';
import { User, Mail, Settings, Save, Loader2, Edit3, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profiles, mentors, goals as goalsService, Mentor, Goal } from '../../lib/supabase';
import { IntegrationSettings } from '../settings/IntegrationSettings';

export const ProfileSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'integrations'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    default_mentor_id: profile?.default_mentor_id || '',
    preferred_mode: profile?.preferred_mode || 'classic',
  });

  useEffect(() => {
    if (activeTab === 'profile' || activeTab === 'goals') {
      loadData();
    }
  }, [user?.id, activeTab]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [mentorsResult, goalsResult] = await Promise.all([
        mentors.getAll(),
        goalsService.getAll(user.id),
      ]);
      
      setAvailableMentors(mentorsResult.mentors);
      setUserGoals(goalsResult.goals);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      await profiles.update(user.id, formData);
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddGoal = async () => {
    if (!user?.id || !newGoal.trim()) return;
    
    try {
      const { data } = await goalsService.create(user.id, newGoal.trim());
      if (data) {
        setUserGoals([...userGoals, data]);
        setNewGoal('');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleRemoveGoal = async (goalId: string) => {
    try {
      await goalsService.delete(goalId);
      setUserGoals(userGoals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error removing goal:', error);
    }
  };

  if (loading && activeTab !== 'integrations') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-body text-neutral-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
              Settings
            </h1>
            <p className="font-body text-neutral-600">
              Manage your account, preferences, goals, and integrations.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 border border-border w-fit">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-md font-body transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-600 hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 rounded-md font-body transition-colors ${
                activeTab === 'goals'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-600 hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Goals</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-6 py-3 rounded-md font-body transition-colors ${
                activeTab === 'integrations'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-600 hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>Integrations</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-primary" />
                    <h2 className="font-heading font-semibold text-xl text-foreground">
                      Personal Information
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-11 pr-4 py-3 border border-border rounded-lg font-body text-neutral-600 bg-neutral-50 cursor-not-allowed"
                        />
                      </div>
                      <p className="font-body text-xs text-neutral-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mentor Preferences */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="w-6 h-6 text-primary" />
                    <h2 className="font-heading font-semibold text-xl text-foreground">
                      Mentor Preferences
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                        Default Mentor
                      </label>
                      <select
                        value={formData.default_mentor_id}
                        onChange={(e) => setFormData({ ...formData, default_mentor_id: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      >
                        <option value="">Select a mentor</option>
                        {availableMentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.name} ({mentor.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-body text-sm font-medium text-neutral-700 mb-2">
                        Preferred Check-in Mode
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                          <input
                            type="radio"
                            name="preferred_mode"
                            value="classic"
                            checked={formData.preferred_mode === 'classic'}
                            onChange={(e) => setFormData({ ...formData, preferred_mode: e.target.value as 'classic' | 'realtime' })}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-body font-medium text-foreground">Classic</div>
                            <div className="font-body text-sm text-neutral-600">Quick form + video</div>
                          </div>
                        </label>
                        <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                          <input
                            type="radio"
                            name="preferred_mode"
                            value="realtime"
                            checked={formData.preferred_mode === 'realtime'}
                            onChange={(e) => setFormData({ ...formData, preferred_mode: e.target.value as 'classic' | 'realtime' })}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-body font-medium text-foreground">Real-Time</div>
                            <div className="font-body text-sm text-neutral-600">Live conversation</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Save Changes */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Stats */}
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                    Account Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-body text-neutral-600">Member since</span>
                      <span className="font-body text-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-neutral-600">Total goals</span>
                      <span className="font-body text-foreground">{userGoals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-neutral-600">Current streak</span>
                      <span className="font-body text-primary font-medium">7 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center space-x-3 mb-6">
                <Edit3 className="w-6 h-6 text-primary" />
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  Manage Goals
                </h2>
              </div>

              {/* Add New Goal */}
              <div className="flex space-x-3 mb-6">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new goal..."
                  className="flex-1 px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Current Goals */}
              <div className="space-y-3">
                {userGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-4 bg-accent rounded-lg"
                  >
                    <span className="font-body text-foreground">{goal.text}</span>
                    <button
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors font-body text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {userGoals.length === 0 && (
                  <p className="font-body text-neutral-600 text-center py-4">
                    No goals set yet. Add your first goal above!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && <IntegrationSettings />}
        </div>
      </div>
    </div>
  );
};