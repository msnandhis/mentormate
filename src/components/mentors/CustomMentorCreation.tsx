import React, { useState } from 'react';
import { User, Brain, Mic, Lightbulb, Plus, Save, Loader2, Sparkles, Settings, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customAvatars, mentors } from '../../lib/supabase';

interface CustomMentorForm {
  name: string;
  category: 'fitness' | 'wellness' | 'study' | 'career' | 'custom';
  personality_traits: string[];
  speaking_style: string;
  expertise_areas: string[];
  motivation_approach: string;
  tone: 'encouraging' | 'direct' | 'analytical' | 'casual' | 'formal';
  response_style: {
    emoji_use: 'none' | 'minimal' | 'moderate' | 'frequent';
    encouragement_level: 'low' | 'medium' | 'high';
    challenge_level: 'low' | 'medium' | 'high';
    formality: 'casual' | 'professional' | 'friendly';
  };
  prompt_template: string;
  gradient: string;
}

const personalityTraits = [
  'Empathetic', 'Direct', 'Analytical', 'Creative', 'Supportive',
  'Challenging', 'Patient', 'Energetic', 'Calm', 'Humorous',
  'Practical', 'Inspirational', 'Logical', 'Intuitive', 'Disciplined'
];

const expertiseOptions = {
  fitness: ['Weight Training', 'Cardio', 'Yoga', 'Nutrition', 'Recovery', 'Sports', 'Flexibility'],
  wellness: ['Meditation', 'Stress Management', 'Sleep', 'Mental Health', 'Mindfulness', 'Work-Life Balance'],
  study: ['Time Management', 'Note Taking', 'Memory Techniques', 'Research', 'Writing', 'Test Prep'],
  career: ['Leadership', 'Networking', 'Public Speaking', 'Project Management', 'Communication', 'Goal Setting'],
  custom: ['Personal Development', 'Creativity', 'Relationships', 'Finance', 'Travel', 'Hobbies']
};

const gradients = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-teal-500',
  'from-green-500 to-blue-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-purple-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500'
];

export const CustomMentorCreation: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomMentorForm>({
    name: '',
    category: 'custom',
    personality_traits: [],
    speaking_style: '',
    expertise_areas: [],
    motivation_approach: '',
    tone: 'encouraging',
    response_style: {
      emoji_use: 'moderate',
      encouragement_level: 'medium',
      challenge_level: 'medium',
      formality: 'friendly'
    },
    prompt_template: '',
    gradient: gradients[0]
  });

  const addPersonalityTrait = (trait: string) => {
    if (!formData.personality_traits.includes(trait) && formData.personality_traits.length < 5) {
      setFormData(prev => ({
        ...prev,
        personality_traits: [...prev.personality_traits, trait]
      }));
    }
  };

  const removePersonalityTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality_traits: prev.personality_traits.filter(t => t !== trait)
    }));
  };

  const addExpertiseArea = (area: string) => {
    if (!formData.expertise_areas.includes(area) && formData.expertise_areas.length < 6) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, area]
      }));
    }
  };

  const removeExpertiseArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter(a => a !== area)
    }));
  };

  const generatePromptTemplate = () => {
    const traits = formData.personality_traits.join(', ').toLowerCase();
    const expertise = formData.expertise_areas.join(', ').toLowerCase();
    
    const template = `You are ${formData.name}, a ${formData.category} mentor with these personality traits: ${traits}. 

Your expertise includes: ${expertise}.

Your speaking style: ${formData.speaking_style}
Your motivation approach: ${formData.motivation_approach}
Your tone: ${formData.tone}

Response guidelines:
- Use ${formData.response_style.emoji_use} emojis
- Provide ${formData.response_style.encouragement_level} encouragement
- Challenge users at a ${formData.response_style.challenge_level} level
- Maintain a ${formData.response_style.formality} communication style

Always respond in character, providing helpful, personalized advice that reflects your unique personality and expertise.`;

    setFormData(prev => ({ ...prev, prompt_template: template }));
  };

  const createCustomMentor = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Create custom avatar record
      const { data: avatar, error: avatarError } = await customAvatars.create({
        user_id: user.id,
        name: formData.name,
        avatar_type: 'custom',
        configuration: {
          personality_traits: formData.personality_traits,
          speaking_style: formData.speaking_style,
          expertise_areas: formData.expertise_areas,
          motivation_approach: formData.motivation_approach,
          tone: formData.tone,
          response_style: formData.response_style,
          gradient: formData.gradient
        },
        training_data: {
          prompt_template: formData.prompt_template,
          created_method: 'custom_creation'
        }
      });

      if (avatarError) {
        throw avatarError;
      }

      // For a full implementation, you would also create a custom mentor record
      // This would require extending the mentors table to support user-created mentors

      alert('Custom mentor created successfully! You can now use your personalized AI mentor.');
      
    } catch (error) {
      console.error('Error creating custom mentor:', error);
      alert('Failed to create custom mentor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          Basic Information
        </h2>
        <p className="font-body text-neutral-600">
          Let's start by defining your mentor's core identity
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Mentor Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Dr. Sarah, Coach Mike, Mentor Alex"
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="fitness">Fitness & Health</option>
            <option value="wellness">Mental Wellness</option>
            <option value="study">Study & Learning</option>
            <option value="career">Career & Professional</option>
            <option value="custom">Custom Category</option>
          </select>
        </div>

        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Visual Theme
          </label>
          <div className="grid grid-cols-4 gap-3">
            {gradients.map((gradient, index) => (
              <button
                key={index}
                onClick={() => setFormData(prev => ({ ...prev, gradient }))}
                className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-lg border-2 transition-all ${
                  formData.gradient === gradient ? 'border-foreground scale-110' : 'border-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          Personality & Traits
        </h2>
        <p className="font-body text-neutral-600">
          Define your mentor's unique personality characteristics
        </p>
      </div>

      <div>
        <label className="block font-body font-medium text-foreground mb-3">
          Personality Traits (Choose up to 5)
        </label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {personalityTraits.map(trait => (
            <button
              key={trait}
              onClick={() => addPersonalityTrait(trait)}
              disabled={formData.personality_traits.includes(trait)}
              className={`p-2 text-sm font-body rounded-lg border transition-colors ${
                formData.personality_traits.includes(trait)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:border-primary'
              }`}
            >
              {trait}
            </button>
          ))}
        </div>
        
        {formData.personality_traits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.personality_traits.map(trait => (
              <span
                key={trait}
                onClick={() => removePersonalityTrait(trait)}
                className="px-3 py-1 bg-primary text-white rounded-full text-sm font-body cursor-pointer hover:bg-primary-600"
              >
                {trait} ×
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Speaking Style
          </label>
          <textarea
            value={formData.speaking_style}
            onChange={(e) => setFormData(prev => ({ ...prev, speaking_style: e.target.value }))}
            placeholder="e.g., Conversational and warm, uses simple language, asks thoughtful questions"
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Motivation Approach
          </label>
          <textarea
            value={formData.motivation_approach}
            onChange={(e) => setFormData(prev => ({ ...prev, motivation_approach: e.target.value }))}
            placeholder="e.g., Focuses on small wins, celebrates progress, provides gentle accountability"
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          Expertise & Knowledge
        </h2>
        <p className="font-body text-neutral-600">
          Define what your mentor specializes in and knows about
        </p>
      </div>

      <div>
        <label className="block font-body font-medium text-foreground mb-3">
          Areas of Expertise (Choose up to 6)
        </label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {expertiseOptions[formData.category].map(area => (
            <button
              key={area}
              onClick={() => addExpertiseArea(area)}
              disabled={formData.expertise_areas.includes(area)}
              className={`p-2 text-sm font-body rounded-lg border transition-colors ${
                formData.expertise_areas.includes(area)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:border-primary'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
        
        {formData.expertise_areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.expertise_areas.map(area => (
              <span
                key={area}
                onClick={() => removeExpertiseArea(area)}
                className="px-3 py-1 bg-primary text-white rounded-full text-sm font-body cursor-pointer hover:bg-primary-600"
              >
                {area} ×
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Communication Tone
          </label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as any }))}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="encouraging">Encouraging</option>
            <option value="direct">Direct</option>
            <option value="analytical">Analytical</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>

        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Formality Level
          </label>
          <select
            value={formData.response_style.formality}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              response_style: { ...prev.response_style, formality: e.target.value as any }
            }))}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
          Response Preferences
        </h2>
        <p className="font-body text-neutral-600">
          Fine-tune how your mentor communicates and responds
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Emoji Usage
          </label>
          <select
            value={formData.response_style.emoji_use}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              response_style: { ...prev.response_style, emoji_use: e.target.value as any }
            }))}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="none">None</option>
            <option value="minimal">Minimal</option>
            <option value="moderate">Moderate</option>
            <option value="frequent">Frequent</option>
          </select>
        </div>

        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Encouragement Level
          </label>
          <select
            value={formData.response_style.encouragement_level}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              response_style: { ...prev.response_style, encouragement_level: e.target.value as any }
            }))}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block font-body font-medium text-foreground mb-2">
            Challenge Level
          </label>
          <select
            value={formData.response_style.challenge_level}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              response_style: { ...prev.response_style, challenge_level: e.target.value as any }
            }))}
            className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block font-body font-medium text-foreground">
            AI Prompt Template (Advanced)
          </label>
          <button
            onClick={generatePromptTemplate}
            className="text-sm font-body text-primary hover:text-primary-600 transition-colors"
          >
            Generate Template
          </button>
        </div>
        <textarea
          value={formData.prompt_template}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt_template: e.target.value }))}
          placeholder="This will be automatically generated based on your selections, or you can customize it here..."
          rows={6}
          className="w-full px-4 py-3 border border-border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
        />
      </div>
    </div>
  );

  const renderStep5 = () => {
    const previewMentor = {
      name: formData.name,
      personality_traits: formData.personality_traits,
      speaking_style: formData.speaking_style,
      expertise_areas: formData.expertise_areas,
      tone: formData.tone,
      gradient: formData.gradient
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${formData.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
            Preview & Create
          </h2>
          <p className="font-body text-neutral-600">
            Review your custom mentor before creating
          </p>
        </div>

        <div className="bg-accent rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${formData.gradient} rounded-lg flex items-center justify-center`}>
              <span className="font-heading font-bold text-white">
                {formData.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                {formData.name}
              </h3>
              <p className="font-body text-neutral-600 capitalize">
                {formData.category} mentor
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-body font-medium text-foreground">Personality: </span>
              <span className="font-body text-neutral-700">
                {formData.personality_traits.join(', ')}
              </span>
            </div>
            
            <div>
              <span className="font-body font-medium text-foreground">Expertise: </span>
              <span className="font-body text-neutral-700">
                {formData.expertise_areas.join(', ')}
              </span>
            </div>
            
            <div>
              <span className="font-body font-medium text-foreground">Communication: </span>
              <span className="font-body text-neutral-700">
                {formData.tone} tone, {formData.response_style.formality} style
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-body font-semibold text-blue-800 mb-2">
            What happens next?
          </h4>
          <ul className="font-body text-blue-700 text-sm space-y-1">
            <li>• Your custom mentor will be created with the specified personality</li>
            <li>• They'll be available for check-ins and conversations immediately</li>
            <li>• You can modify their settings anytime in your profile</li>
            <li>• The AI will respond according to your defined parameters</li>
          </ul>
        </div>
      </div>
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.personality_traits.length > 0 && formData.speaking_style.trim().length > 0;
      case 3:
        return formData.expertise_areas.length > 0;
      case 4:
        return formData.prompt_template.trim().length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-sm text-neutral-600">
              Step {currentStep} of 5
            </span>
            <span className="font-body text-sm text-neutral-600">
              {Math.round((currentStep / 5) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 font-body px-6 py-3 text-neutral-600 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Back</span>
            </button>

            {currentStep === 5 ? (
              <button
                onClick={createCustomMentor}
                disabled={!isStepValid() || loading}
                className="flex items-center space-x-2 font-body px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Mentor</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 font-body px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Continue</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};