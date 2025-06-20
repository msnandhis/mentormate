import React, { useState, useEffect } from 'react';
import { Video, Play, Download, RefreshCw, AlertCircle, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { videoGenerations, mentorResponses, VideoGeneration, MentorResponse, mentors } from '../../lib/supabase';
import { tavusAPI, pollVideoStatus, generateMentorVideo } from '../../lib/tavus';
import { VideoPlayer } from './VideoPlayer';

interface VideoGenerationManagerProps {
  checkinId?: string;
  mentorResponseId?: string;
  autoGenerate?: boolean;
}

export const VideoGenerationManager: React.FC<VideoGenerationManagerProps> = ({
  checkinId,
  mentorResponseId,
  autoGenerate = false,
}) => {
  const { user } = useAuth();
  const [generation, setGeneration] = useState<VideoGeneration | null>(null);
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (checkinId || mentorResponseId) {
      loadData();
    }
  }, [checkinId, mentorResponseId]);

  useEffect(() => {
    if (autoGenerate && mentorResponse && mentor && !generation) {
      handleGenerateVideo();
    }
  }, [autoGenerate, mentorResponse, mentor, generation]);

  const loadData = async () => {
    try {
      if (checkinId) {
        const { generation: existingGeneration } = await videoGenerations.getByCheckin(checkinId);
        setGeneration(existingGeneration);
      }

      if (mentorResponseId) {
        const { response } = await mentorResponses.getByCheckin(mentorResponseId);
        setMentorResponse(response);
        
        if (response?.mentor_id) {
          const { mentor: mentorData } = await mentors.getById(response.mentor_id);
          setMentor(mentorData);
        }
        
        if (response?.video_generation_id) {
          const { generation: existingGeneration } = await videoGenerations.getByCheckin(response.video_generation_id);
          setGeneration(existingGeneration);
        }
      }
    } catch (error) {
      console.error('Error loading video data:', error);
      setError('Failed to load video data');
    }
  };

  const handleGenerateVideo = async () => {
    if (!user?.id || !mentorResponse || !mentor) {
      setError('Missing required data for video generation');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Determine avatar configuration
      let avatarId = 'default_mentor';
      let mentorConfig = {};

      if (mentor.avatar_config) {
        mentorConfig = mentor.avatar_config;
        if (mentor.avatar_config.persona_id && mentor.avatar_config.replica_id) {
          // Use persona/replica IDs for newer avatars (like ZenKai)
          avatarId = mentor.avatar_config.replica_id;
        } else if (mentor.tavus_avatar_id) {
          // Use legacy avatar ID
          avatarId = mentor.tavus_avatar_id;
        }
      } else if (mentor.tavus_avatar_id) {
        avatarId = mentor.tavus_avatar_id;
      }

      // Create video generation record
      const { data: newGeneration } = await videoGenerations.create({
        user_id: user.id,
        checkin_id: checkinId,
        mentor_response_id: mentorResponseId,
        avatar_id: avatarId,
        script_text: mentorResponse.response_text,
        metadata: {
          mentor_id: mentorResponse.mentor_id,
          mentor_name: mentor.name,
          prompt_data: mentorResponse.prompt_data,
          avatar_config: mentorConfig,
        },
      });

      if (!newGeneration) {
        throw new Error('Failed to create video generation record');
      }

      setGeneration(newGeneration);

      // Start video generation with Tavus
      const videoResponse = await generateMentorVideo(
        mentor.name,
        {
          ...mentorConfig,
          tavus_avatar_id: mentor.tavus_avatar_id,
        },
        mentorResponse.response_text,
        mentor.avatar_config?.voice_settings
      );

      // Update generation with Tavus request ID
      await videoGenerations.update(newGeneration.id, {
        tavus_request_id: videoResponse.video_id,
        status: 'generating',
      });

      // Simulate progress for UI feedback
      let currentProgress = 10;
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress < 90) {
          setProgress(Math.min(currentProgress, 90));
        }
      }, 2000);

      // Poll for completion
      await pollVideoStatus(
        videoResponse.video_id,
        async (completedVideo) => {
          clearInterval(progressInterval);
          
          // Update generation with completed video
          const { data: updatedGeneration } = await videoGenerations.update(newGeneration.id, {
            status: 'completed',
            video_url: completedVideo.video_url,
            thumbnail_url: completedVideo.thumbnail_url,
            duration_seconds: completedVideo.duration,
            generation_time_ms: completedVideo.processing_time,
          });

          // Update mentor response with video URL
          if (mentorResponseId) {
            await mentorResponses.update(mentorResponseId, {
              video_url: completedVideo.video_url,
              tavus_video_id: videoResponse.video_id,
              video_generation_id: newGeneration.id,
            });
          }

          setGeneration(updatedGeneration);
          setProgress(100);
        },
        (error) => {
          clearInterval(progressInterval);
          setError(error);
          videoGenerations.update(newGeneration.id, {
            status: 'failed',
            error_message: error,
          });
        }
      );

    } catch (error) {
      console.error('Error generating video:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate video');
      
      if (generation) {
        await videoGenerations.update(generation.id, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryGeneration = async () => {
    if (generation) {
      await videoGenerations.update(generation.id, {
        status: 'queued',
        error_message: null,
      });
      await handleGenerateVideo();
    }
  };

  const getStatusIcon = () => {
    if (!generation) return <Video className="w-5 h-5 text-neutral-400" />;
    
    switch (generation.status) {
      case 'queued':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'generating':
        return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Video className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStatusText = () => {
    if (!generation) return 'No video generated';
    
    switch (generation.status) {
      case 'queued':
        return 'Queued for generation';
      case 'generating':
        return `Generating ${mentor?.name || 'AI'} video...`;
      case 'completed':
        return 'Video ready';
      case 'failed':
        return 'Generation failed';
      default:
        return 'Unknown status';
    }
  };

  const isZenKai = mentor?.name === 'ZenKai';

  return (
    <div className={`bg-white rounded-xl p-6 border border-border ${isZenKai ? 'bg-gradient-to-br from-blue-50 to-teal-50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-heading font-semibold text-foreground flex items-center space-x-2">
              <span>{mentor?.name || 'AI Mentor'} Video Response</span>
              {isZenKai && <Sparkles className="w-4 h-4 text-blue-500" />}
            </h3>
            <p className="font-body text-sm text-neutral-600">
              {getStatusText()}
              {isZenKai && generation?.status === 'generating' && (
                <span className="text-blue-600"> • Using advanced ZenKai persona</span>
              )}
            </p>
          </div>
        </div>

        {!generation && mentorResponse && (
          <button
            onClick={handleGenerateVideo}
            disabled={loading}
            className={`flex items-center space-x-2 font-body px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              isZenKai ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 'bg-primary hover:bg-primary-600'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Generate {mentor?.name || 'AI'} Video</span>
          </button>
        )}

        {generation?.status === 'failed' && (
          <button
            onClick={handleRetryGeneration}
            disabled={loading}
            className="flex items-center space-x-2 font-body px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* ZenKai-specific status message */}
      {isZenKai && generation?.status === 'generating' && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <p className="font-body text-blue-800 text-sm">
              Creating your personalized ZenKai video with advanced AI persona technology...
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {loading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm text-neutral-600">
              Generating {mentor?.name || 'AI'} video...
            </span>
            <span className="font-body text-sm text-neutral-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isZenKai ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isZenKai && (
            <p className="font-body text-xs text-blue-600 mt-1">
              Enhanced processing with ZenKai's personalized AI model
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-body font-medium text-red-800">
                Video Generation Failed
              </h4>
              <p className="font-body text-red-700 text-sm mt-1">
                {error}
              </p>
              {isZenKai && (
                <p className="font-body text-red-600 text-xs mt-1">
                  ZenKai persona may be temporarily unavailable. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {generation?.status === 'completed' && generation.video_url && (
        <div className="space-y-4">
          <VideoPlayer
            src={generation.video_url}
            thumbnail={generation.thumbnail_url}
            title={`${mentor?.name || 'AI Mentor'} Response`}
            className="aspect-video"
          />
          
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <div className="flex items-center space-x-4">
              {generation.duration_seconds && (
                <span>Duration: {Math.round(generation.duration_seconds)}s</span>
              )}
              {generation.generation_time_ms && (
                <span>Generated in: {(generation.generation_time_ms / 1000).toFixed(1)}s</span>
              )}
              {isZenKai && (
                <span className="text-blue-600 font-medium">✨ ZenKai Persona</span>
              )}
            </div>
            
            {generation.video_url && (
              <a
                href={generation.video_url}
                download
                className="flex items-center space-x-1 text-primary hover:text-primary-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Script Preview */}
      {mentorResponse && (
        <div className={`mt-4 p-4 rounded-lg ${isZenKai ? 'bg-blue-50 border border-blue-200' : 'bg-accent'}`}>
          <h4 className={`font-body font-medium mb-2 ${isZenKai ? 'text-blue-800' : 'text-foreground'}`}>
            {mentor?.name || 'AI Mentor'} Response Script
          </h4>
          <p className={`font-body text-sm leading-relaxed ${isZenKai ? 'text-blue-700' : 'text-neutral-700'}`}>
            {mentorResponse.response_text}
          </p>
        </div>
      )}

      {/* Technical Details for ZenKai */}
      {isZenKai && generation && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
          <h4 className="font-body font-semibold text-blue-800 text-sm mb-2">
            ZenKai Technical Details
          </h4>
          <div className="font-body text-xs text-blue-700 space-y-1">
            <div>Persona ID: pa34d77a26e9</div>
            <div>Replica ID: rca8a38779a8</div>
            <div>Voice Settings: Enhanced stability & similarity boost</div>
            <div>Background: Calm office environment</div>
          </div>
        </div>
      )}
    </div>
  );
};