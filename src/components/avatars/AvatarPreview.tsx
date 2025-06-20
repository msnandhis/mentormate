import React, { useState } from 'react';
import { Play, X, Settings, Download } from 'lucide-react';
import { TavusAvatar, tavusAPI } from '../../lib/tavus';
import { VideoPlayer } from '../video/VideoPlayer';

interface AvatarPreviewProps {
  avatar: TavusAvatar;
  onClose: () => void;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  avatar,
  onClose,
}) => {
  const [testScript, setTestScript] = useState('Hello! This is a test of my custom avatar. How does this look and sound?');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testVideoUrl, setTestVideoUrl] = useState<string | null>(null);

  const generateTestVideo = async () => {
    if (!testScript.trim()) return;

    setIsGenerating(true);
    try {
      const response = await tavusAPI.generateVideo({
        avatar_id: avatar.avatar_id,
        script: testScript.trim(),
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
        },
      });

      // In a real implementation, you'd poll for completion
      // For now, we'll use the mock video URL
      setTestVideoUrl(response.video_url || null);
    } catch (error) {
      console.error('Error generating test video:', error);
      alert('Failed to generate test video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">
              {avatar.avatar_name}
            </h2>
            <p className="font-body text-neutral-600">
              Avatar Preview & Testing
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">
                Avatar Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-body text-neutral-600">Avatar ID:</span>
                  <span className="font-body text-foreground font-mono text-sm">
                    {avatar.avatar_id}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-body text-neutral-600">Status:</span>
                  <span className={`font-body font-medium ${
                    avatar.status === 'ready' ? 'text-success' : 
                    avatar.status === 'training' ? 'text-warning' : 
                    'text-destructive'
                  }`}>
                    {avatar.status.charAt(0).toUpperCase() + avatar.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-body text-neutral-600">Type:</span>
                  <span className="font-body text-foreground">Custom Avatar</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 font-body px-4 py-3 bg-neutral-100 text-foreground rounded-lg hover:bg-neutral-200 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Configure Settings</span>
                </button>
                
                {avatar.video_url && (
                  <a
                    href={avatar.video_url}
                    download
                    className="w-full flex items-center justify-center space-x-2 font-body px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Source Video</span>
                  </a>
                )}
              </div>
            </div>

            <div>
              {/* Avatar Thumbnail */}
              <h3 className="font-heading font-semibold text-foreground mb-4">
                Preview
              </h3>
              
              <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                {avatar.thumbnail_url ? (
                  <img
                    src={avatar.thumbnail_url}
                    alt={avatar.avatar_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="font-heading font-bold text-primary text-xl">
                          {avatar.avatar_name.charAt(0)}
                        </span>
                      </div>
                      <p className="font-body text-neutral-600">No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Video Generation */}
          {avatar.status === 'ready' && (
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">
                Test Your Avatar
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-body font-medium text-foreground mb-2">
                    Test Script
                  </label>
                  <textarea
                    value={testScript}
                    onChange={(e) => setTestScript(e.target.value)}
                    placeholder="Enter text for your avatar to speak..."
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-lg font-body text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                    maxLength={500}
                  />
                  <p className="font-body text-xs text-neutral-500 mt-1">
                    {testScript.length}/500 characters
                  </p>
                </div>

                <button
                  onClick={generateTestVideo}
                  disabled={!testScript.trim() || isGenerating}
                  className="flex items-center space-x-2 font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Generate Test Video</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Video Result */}
              {testVideoUrl && (
                <div className="mt-6">
                  <h4 className="font-body font-medium text-foreground mb-3">
                    Test Video Result
                  </h4>
                  <VideoPlayer
                    src={testVideoUrl}
                    title="Avatar Test Video"
                    className="aspect-video"
                  />
                </div>
              )}
            </div>
          )}

          {/* Usage Guidelines */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-heading font-semibold text-blue-800 mb-2">
              Avatar Usage Guidelines
            </h4>
            <ul className="font-body text-blue-700 text-sm space-y-1">
              <li>• Keep scripts under 500 characters for best results</li>
              <li>• Video generation typically takes 30-60 seconds</li>
              <li>• Test different scripts to see how your avatar performs</li>
              <li>• Use clear, conversational language for natural delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};