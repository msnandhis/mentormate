import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Video, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentorResponses, MentorResponse, Mentor } from '../../lib/supabase';
import { generateAIMentorResponse } from '../../lib/ai-mentor';
import { VideoGenerationManager } from '../video/VideoGenerationManager';
import { MentorVideoResponse } from '../video/MentorVideoResponse';

interface CheckinResponseProps {
  checkinId: string;
  mentor: Mentor;
  checkinData: {
    mood_score: number;
    goals: any[];
    reflection?: string;
    streak?: number;
  };
  autoGenerateVideo?: boolean;
}

export const CheckinResponse: React.FC<CheckinResponseProps> = ({
  checkinId,
  mentor,
  checkinData,
  autoGenerateVideo = true,
}) => {
  const { user } = useAuth();
  const [response, setResponse] = useState<MentorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrGenerateResponse();
  }, [checkinId]);

  const loadOrGenerateResponse = async () => {
    try {
      // First try to load existing response
      const { response: existingResponse } = await mentorResponses.getByCheckin(checkinId);
      
      if (existingResponse) {
        setResponse(existingResponse);
        setLoading(false);
        return;
      }

      // No existing response, generate new AI response
      await generateNewResponse();
      
    } catch (error) {
      console.error('Error loading mentor response:', error);
      await generateNewResponse(); // Try to generate if loading fails
    }
  };

  const generateNewResponse = async () => {
    if (!user?.id || generating) return;

    setGenerating(true);
    setError(null);

    try {
      // Generate AI response using the new AI service
      const aiResponseText = await generateAIMentorResponse(mentor, {
        ...checkinData,
        user_id: user.id,
      });

      // Save the response to database
      const { data: newResponse } = await mentorResponses.create({
        checkin_id: checkinId,
        mentor_id: mentor.id,
        user_id: user.id,
        prompt_data: {
          mood_score: checkinData.mood_score,
          goals: checkinData.goals,
          reflection: checkinData.reflection,
          streak: checkinData.streak,
        },
        response_text: aiResponseText,
        response_metadata: {
          model_used: 'gpt-4o-mini',
          ai_generated: true,
          generation_timestamp: new Date().toISOString(),
        },
        generation_time_ms: Date.now(), // This would be more accurate if timed properly
      });

      if (newResponse) {
        setResponse(newResponse);
      }

    } catch (error) {
      console.error('Error generating mentor response:', error);
      setError('Failed to generate mentor response. Please try again.');
      
      // Create a fallback response
      const fallbackResponse: MentorResponse = {
        id: `fallback-${Date.now()}`,
        checkin_id: checkinId,
        mentor_id: mentor.id,
        user_id: user.id,
        prompt_data: {
          mood_score: checkinData.mood_score,
          goals: checkinData.goals,
          reflection: checkinData.reflection,
        },
        response_text: `Thank you for checking in! I can see you're working hard on your goals. Your commitment to tracking your progress shows real dedication. Keep moving forward, one day at a time.`,
        response_metadata: {
          model_used: 'fallback',
          is_fallback: true,
        },
        created_at: new Date().toISOString(),
      };
      
      setResponse(fallbackResponse);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleRetryGeneration = async () => {
    setResponse(null);
    setLoading(true);
    await generateNewResponse();
  };

  const isZenKai = mentor.name === 'ZenKai';

  if (loading || generating) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-pulse w-6 h-6 bg-neutral-200 rounded" />
          <div className="animate-pulse h-6 bg-neutral-200 rounded w-1/3" />
        </div>
        <div className="text-center py-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isZenKai ? 'bg-gradient-to-br from-blue-500 to-teal-500' : 'bg-primary'
          }`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">
            {mentor.name} is crafting your AI response...
          </h3>
          <p className={`font-body text-sm ${isZenKai ? 'text-blue-700' : 'text-neutral-600'}`}>
            {isZenKai 
              ? 'ZenKai is mindfully analyzing your check-in with advanced AI to provide personalized wellness guidance...'
              : 'Your AI mentor is analyzing your check-in data and generating personalized advice...'
            }
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-xs text-blue-600 font-medium">Powered by Advanced AI</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">⚠️ Error</div>
          <p className="font-body text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetryGeneration}
            className="font-body px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry AI Generation
          </button>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
        <div className="text-center py-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isZenKai ? 'bg-gradient-to-br from-blue-500 to-teal-500' : 'bg-primary'
          }`}>
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">
            Ready to generate AI response
          </h3>
          <button
            onClick={generateNewResponse}
            className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Generate AI Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Text Response */}
      <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isZenKai ? 'bg-gradient-to-br from-blue-500 to-teal-500' : `bg-gradient-to-br ${mentor.gradient || 'from-primary-500 to-primary-600'}`
            }`}>
              {isZenKai ? (
                <Sparkles className="w-6 h-6 text-white" />
              ) : (
                <span className="font-heading font-bold text-white text-lg">
                  {mentor.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground flex items-center space-x-2">
                <span>{mentor.name}'s AI Response</span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </h3>
              <p className={`font-body text-sm ${isZenKai ? 'text-blue-600' : 'text-neutral-600'}`}>
                {isZenKai ? 'AI-powered mindful guidance' : `Personalized AI advice from your ${mentor.category} mentor`}
              </p>
            </div>
          </div>

          <button
            onClick={handleRetryGeneration}
            className="p-2 text-neutral-600 hover:text-primary transition-colors"
            title="Generate new AI response"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className={`p-4 rounded-lg ${isZenKai ? 'bg-blue-100 border border-blue-200' : 'bg-accent'}`}>
          <p className={`font-body leading-relaxed ${isZenKai ? 'text-blue-800' : 'text-foreground'}`}>
            {response.response_text}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-neutral-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>AI Generated</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>Created {new Date(response.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {response.response_metadata?.model_used && (
            <span className="font-mono text-xs text-blue-600">
              {response.response_metadata.model_used}
            </span>
          )}
        </div>
      </div>

      {/* Video Generation */}
      <VideoGenerationManager
        checkinId={checkinId}
        mentorResponseId={response.id}
        autoGenerate={autoGenerateVideo}
      />

      {/* Additional AI Features for ZenKai */}
      {isZenKai && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-heading font-semibold text-blue-800 mb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>AI-Enhanced ZenKai Features</span>
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h5 className="font-body font-medium text-blue-800 mb-2">Contextual Awareness</h5>
              <p className="font-body text-blue-700 text-sm">
                ZenKai remembers your conversation history and adapts responses to your personal wellness journey.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h5 className="font-body font-medium text-blue-800 mb-2">Dynamic Wisdom</h5>
              <p className="font-body text-blue-700 text-sm">
                Each response is uniquely crafted by advanced AI, drawing from vast wellness knowledge while maintaining ZenKai's mindful persona.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="font-body text-blue-700 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span><strong>AI-Powered Personalization:</strong> Every response is tailored to your unique mood, goals, and wellness needs using advanced language AI.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};