import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Play, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { tavusAPI, TavusAvatar } from '../../lib/tavus';
import { AvatarCreationWizard } from './AvatarCreationWizard';
import { AvatarPreview } from './AvatarPreview';

export const AvatarManager: React.FC = () => {
  const { user } = useAuth();
  const [avatars, setAvatars] = useState<TavusAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<TavusAvatar | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const avatarList = await tavusAPI.listAvatars();
      setAvatars(avatarList);
    } catch (error) {
      console.error('Error loading avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarCreated = (newAvatar: TavusAvatar) => {
    setAvatars(prev => [...prev, newAvatar]);
    setShowCreationWizard(false);
  };

  const handleDeleteAvatar = async (avatarId: string) => {
    if (!confirm('Are you sure you want to delete this avatar? This cannot be undone.')) {
      return;
    }

    try {
      await tavusAPI.deleteAvatar(avatarId);
      setAvatars(prev => prev.filter(a => a.avatar_id !== avatarId));
    } catch (error) {
      console.error('Error deleting avatar:', error);
      alert('Failed to delete avatar. Please try again.');
    }
  };

  const handlePreviewAvatar = (avatar: TavusAvatar) => {
    setSelectedAvatar(avatar);
    setShowPreview(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-success bg-success-50 border-success-200';
      case 'training': return 'text-warning bg-warning-50 border-warning-200';
      case 'error': return 'text-destructive bg-red-50 border-red-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'training': return 'Training';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-neutral-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-xl text-foreground">
              Avatar Manager
            </h3>
            <p className="font-body text-neutral-600 mt-1">
              Create and manage your custom AI avatars
            </p>
          </div>

          <button
            onClick={() => setShowCreationWizard(true)}
            className="flex items-center space-x-2 font-body px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Avatar</span>
          </button>
        </div>

        {/* Avatars Grid */}
        {avatars.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-neutral-400" />
            </div>
            <h4 className="font-heading font-semibold text-foreground mb-2">
              No Custom Avatars Yet
            </h4>
            <p className="font-body text-neutral-600 mb-6">
              Create your first custom avatar to personalize your mentor experience.
            </p>
            <button
              onClick={() => setShowCreationWizard(true)}
              className="font-body px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Your First Avatar
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatars.map((avatar) => (
              <div
                key={avatar.avatar_id}
                className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {/* Avatar Thumbnail */}
                <div className="aspect-video bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                  {avatar.thumbnail_url ? (
                    <img
                      src={avatar.thumbnail_url}
                      alt={avatar.avatar_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="font-heading font-bold text-primary">
                            {avatar.avatar_name.charAt(0)}
                          </span>
                        </div>
                        <p className="font-body text-sm text-neutral-600">No Preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading font-semibold text-foreground">
                      {avatar.avatar_name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(avatar.status)}`}>
                      {getStatusLabel(avatar.status)}
                    </span>
                  </div>
                  
                  <p className="font-body text-sm text-neutral-600">
                    Avatar ID: {avatar.avatar_id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {avatar.status === 'ready' && (
                      <button
                        onClick={() => handlePreviewAvatar(avatar)}
                        className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                        title="Preview avatar"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      className="p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                      title="Edit avatar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {avatar.video_url && (
                      <a
                        href={avatar.video_url}
                        download
                        className="p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                        title="Download video"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteAvatar(avatar.avatar_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete avatar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-heading font-semibold text-blue-800 mb-2">
            Avatar Creation Tips
          </h4>
          <ul className="font-body text-blue-700 text-sm space-y-1">
            <li>• Use high-quality video with good lighting and clear audio</li>
            <li>• Keep the subject centered and looking directly at the camera</li>
            <li>• Avoid background noise and ensure consistent audio levels</li>
            <li>• Training typically takes 5-10 minutes depending on video length</li>
          </ul>
        </div>
      </div>

      {/* Creation Wizard Modal */}
      {showCreationWizard && (
        <AvatarCreationWizard
          onComplete={handleAvatarCreated}
          onCancel={() => setShowCreationWizard(false)}
        />
      )}

      {/* Avatar Preview Modal */}
      {showPreview && selectedAvatar && (
        <AvatarPreview
          avatar={selectedAvatar}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};