import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Video, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mentorResponses, MentorResponse, Mentor } from '../../lib/supabase';
import { VideoGenerationManager } from '../video/VideoGenerationManager';
import { MentorVideoResponse } from '../video/MentorVideoResponse';

interface CheckinResponseProps {
  checkinId: string;
  mentor: Mentor;
  autoGenerateVideo?: boolean;
}

export const CheckinResponse: React.FC<CheckinResponseProps> = ({
  checkinId,
  mentor,
  autoGenerateVideo = true,
}) => {
  const { user } = useAuth();
  const [response, setResponse] = useState<MentorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResponse();
  }, [checkinId]);

  const loadResponse = async () => {
    try {
      const { response: mentorResponse } = await mentorResponses.getByCheckin(checkinId);
      setResponse(mentorResponse);
    } catch (error) {
      console.error('Error loading mentor response:', error);
      setError('Failed to load mentor response');
    } finally {
      setLoading(false);
    }
  };

  const isZenKai = mentor.name === 'ZenKai';

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-pulse w-6 h-6 bg-neutral-200 rounded" />
          <div className="animate-pulse h-6 bg-neutral-200 rounded w-1/3" />
        </div>
        <div className="space-y-3">
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-full" />
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-3/4" />
          <div className="animate-pulse h-4 bg-neutral-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">⚠️ Error</div>
          <p className="font-body text-red-600">{error}</p>
          <button
            onClick={loadResponse}
            className="mt-4 font-body px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
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
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">
            {mentor.name} is preparing your response...
          </h3>
          <p className={`font-body ${isZenKai ? 'text-blue-700' : 'text-neutral-600'}`}>
            {isZenKai 
              ? 'ZenKai is mindfully crafting a personalized response for your wellness journey...'
              : 'Your AI mentor is analyzing your check-in and creating a personalized response...'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Text Response */}
      <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
        <div className="flex items-center space-x-3 mb-4">
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
            <h3 className="font-heading font-semibold text-foreground">
              {mentor.name}'s Response
            </h3>
            <p className={`font-body text-sm ${isZenKai ? 'text-blue-600' : 'text-neutral-600'}`}>
              {isZenKai ? 'Mindful guidance for your wellness journey' : `Personalized advice from your ${mentor.category} mentor`}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isZenKai ? 'bg-blue-100 border border-blue-200' : 'bg-accent'}`}>
          <p className={`font-body leading-relaxed ${isZenKai ? 'text-blue-800' : 'text-foreground'}`}>
            {response.response_text}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-neutral-500">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Generated {new Date(response.created_at).toLocaleDateString()}</span>
          </div>
          {response.generation_time_ms && (
            <span>Response time: {(response.generation_time_ms / 1000).toFixed(1)}s</span>
          )}
        </div>
      </div>

      {/* Video Generation */}
      <VideoGenerationManager
        checkinId={checkinId}
        mentorResponseId={response.id}
        autoGenerate={autoGenerateVideo}
      />

      {/* Additional ZenKai Features */}
      {isZenKai && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-heading font-semibold text-blue-800 mb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>ZenKai's Mindful Features</span>
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h5 className="font-body font-medium text-blue-800 mb-2">Breathing Exercise</h5>
              <p className="font-body text-blue-700 text-sm">
                Take a moment to breathe deeply. Inhale for 4 counts, hold for 4, exhale for 4.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h5 className="font-body font-medium text-blue-800 mb-2">Mindful Reminder</h5>
              <p className="font-body text-blue-700 text-sm">
                Remember: Progress, not perfection. Every small step matters on your wellness journey.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="font-body text-blue-700 text-sm">
              💡 <strong>ZenKai Tip:</strong> For the best experience, use headphones when watching your personalized video response.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};