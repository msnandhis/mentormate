import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Download, Share2, MessageSquare } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { MentorResponse } from '../../lib/supabase';

interface MentorVideoResponseProps {
  response: MentorResponse;
  autoPlay?: boolean;
  onReplay?: () => void;
  onShare?: () => void;
}

export const MentorVideoResponse: React.FC<MentorVideoResponseProps> = ({
  response,
  autoPlay = false,
  onReplay,
  onShare,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  const handleVideoEnd = () => {
    setHasWatched(true);
  };

  const formatGenerationTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">
              Video Response
            </h3>
            <p className="font-body text-sm text-neutral-600">
              Generated {response.generation_time_ms ? 
                `in ${formatGenerationTime(response.generation_time_ms)}` : 
                'just now'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-neutral-600 hover:text-primary transition-colors"
              title="Share video"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          
          {response.video_url && (
            <a
              href={response.video_url}
              download
              className="p-2 text-neutral-600 hover:text-primary transition-colors"
              title="Download video"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Video Player */}
      {response.video_url ? (
        <div className="mb-4">
          <VideoPlayer
            src={response.video_url}
            title="Mentor Response"
            autoPlay={autoPlay}
            onEnded={handleVideoEnd}
            className="aspect-video"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h4 className="font-heading font-semibold text-foreground mb-2">
              Generating Video...
            </h4>
            <p className="font-body text-neutral-600">
              Your personalized video response is being created
            </p>
          </div>
        </div>
      )}

      {/* Text Response */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-body font-medium text-foreground">Response Text</h4>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center space-x-2 font-body text-sm text-primary hover:text-primary-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showTranscript ? 'Hide' : 'Show'} Transcript</span>
          </button>
        </div>

        {showTranscript && (
          <div className="p-4 bg-accent rounded-lg">
            <p className="font-body text-foreground leading-relaxed">
              {response.response_text}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          {hasWatched && onReplay && (
            <button
              onClick={onReplay}
              className="flex items-center space-x-2 font-body text-primary hover:text-primary-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Request New Response</span>
            </button>
          )}
        </div>

        <div className="text-right">
          <p className="font-body text-xs text-neutral-500">
            Created {new Date(response.created_at).toLocaleDateString()}
          </p>
          {response.response_metadata?.model_used && (
            <p className="font-body text-xs text-neutral-500">
              Model: {response.response_metadata.model_used}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};