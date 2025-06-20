// Enhanced Tavus API integration with ZenKai-specific implementation
// Production implementation with real API integration

const TAVUS_API_URL = 'https://tavusapi.com/v2';
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || '';
const TAVUS_WEBHOOK_URL = import.meta.env.VITE_TAVUS_WEBHOOK_URL || '';
const TAVUS_ENVIRONMENT = import.meta.env.VITE_TAVUS_ENVIRONMENT || 'production';

// ZenKai specific configuration
const ZENKAI_CONFIG = {
  avatar_id: 'rca8a38779a8', // Use avatar_id instead of persona/replica for compatibility
  persona_id: 'pa34d77a26e9',
  replica_id: 'rca8a38779a8',
  voice_settings: {
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true,
  },
  background: 'calm_office',
  video_settings: {
    quality: 'high',
    format: 'mp4',
    resolution: '1080p'
  }
};

if (!TAVUS_API_KEY) {
  console.warn('Tavus API key not found. Video features will use mock data.');
}

export interface TavusAvatar {
  avatar_id: string;
  avatar_name: string;
  status: 'ready' | 'training' | 'error' | 'pending';
  thumbnail_url?: string;
  video_url?: string;
  created_at?: string;
  training_progress?: number;
  error_message?: string;
  persona_id?: string;
  replica_id?: string;
}

export interface TavusVideoRequest {
  avatar_id?: string;
  persona_id?: string;
  replica_id?: string;
  script: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost?: boolean;
  };
  background?: string;
  callback_url?: string;
  video_name?: string;
  quality?: 'standard' | 'high';
}

export interface TavusConversationRequest {
  replica_id: string;
  persona_id: string;
  script?: string;
  callback_url?: string;
}

export interface TavusVideoResponse {
  video_id: string;
  status: 'queued' | 'generating' | 'completed' | 'error';
  video_url?: string;
  thumbnail_url?: string;
  download_url?: string;
  error_message?: string;
  created_at?: string;
  duration?: number;
  processing_time?: number;
  persona_id?: string;
  replica_id?: string;
}

export interface TavusVoiceCloneRequest {
  voice_name: string;
  voice_samples: File[];
  callback_url?: string;
  language?: string;
  base_persona_id?: string;
}

export interface TavusVoiceCloneResponse {
  voice_id: string;
  voice_name: string;
  status: 'training' | 'ready' | 'error';
  training_progress?: number;
  error_message?: string;
  created_at?: string;
  language?: string;
  persona_id?: string;
}

export interface TavusWebhookPayload {
  event_type: 'avatar.ready' | 'avatar.error' | 'video.completed' | 'video.error' | 'voice.ready' | 'voice.error';
  data: {
    id: string;
    status: string;
    error_message?: string;
    video_url?: string;
    thumbnail_url?: string;
    download_url?: string;
    training_progress?: number;
    persona_id?: string;
    replica_id?: string;
  };
  timestamp: string;
}

class TavusAPI {
  private apiKey: string;
  private baseUrl: string;
  private webhookUrl: string;
  private environment: string;

  constructor() {
    this.apiKey = TAVUS_API_KEY;
    this.baseUrl = TAVUS_API_URL;
    this.webhookUrl = TAVUS_WEBHOOK_URL;
    this.environment = TAVUS_ENVIRONMENT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your .env file.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    // Add common headers
    const headers: HeadersInit = {
      'x-api-key': this.apiKey,
      ...options.headers,
    };

    // Only add Content-Type for JSON requests
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Tavus API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.message || errorData.error || JSON.stringify(errorData) || response.statusText}`;
      } catch {
        errorMessage += ` - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Helper function to clean request object of undefined/null values
  private cleanRequest(request: any): any {
    const cleaned: any = {};
    Object.keys(request).forEach(key => {
      if (request[key] !== undefined && request[key] !== null) {
        cleaned[key] = request[key];
      }
    });
    return cleaned;
  }

  // Video Generation with ZenKai support using conversations endpoint
  async generateVideo(request: TavusVideoRequest): Promise<TavusVideoResponse> {
    if (!this.apiKey) {
      // Enhanced mock response for development
      const videoId = `mock_video_${Date.now()}`;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            video_id: videoId,
            status: 'generating',
            created_at: new Date().toISOString(),
            persona_id: request.persona_id,
            replica_id: request.replica_id,
          });
        }, 1000);
      });
    }

    const requestBody = this.cleanRequest({
      ...request,
      callback_url: this.webhookUrl ? `${this.webhookUrl}/video` : undefined,
    });

    return this.request<TavusVideoResponse>('/videos', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // ZenKai-specific video generation using conversations endpoint
  async generateZenKaiVideo(script: string, customSettings?: Partial<TavusVideoRequest>): Promise<TavusVideoResponse> {
    if (!this.apiKey) {
      // Enhanced mock response for development
      const videoId = `mock_video_${Date.now()}`;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            video_id: videoId,
            status: 'generating',
            created_at: new Date().toISOString(),
            persona_id: ZENKAI_CONFIG.persona_id,
            replica_id: ZENKAI_CONFIG.replica_id,
          });
        }, 1000);
      });
    }

    // Use the conversations endpoint with the correct structure
    const request: TavusConversationRequest = {
      replica_id: ZENKAI_CONFIG.replica_id,
      persona_id: ZENKAI_CONFIG.persona_id,
      script: script, // Include the script parameter
      callback_url: this.webhookUrl ? `${this.webhookUrl}/conversation` : undefined,
    };

    const requestBody = this.cleanRequest(request);

    return this.request<TavusVideoResponse>('/conversations', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  async getVideo(videoId: string): Promise<TavusVideoResponse> {
    if (!this.apiKey) {
      return {
        video_id: videoId,
        status: 'completed',
        video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://via.placeholder.com/320x180/2ABB63/FFFFFF?text=ZenKai',
        download_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        created_at: new Date().toISOString(),
        duration: 30,
        persona_id: ZENKAI_CONFIG.persona_id,
        replica_id: ZENKAI_CONFIG.replica_id,
      };
    }

    return this.request<TavusVideoResponse>(`/videos/${videoId}`);
  }

  async listVideos(limit = 50): Promise<TavusVideoResponse[]> {
    if (!this.apiKey) {
      return [];
    }

    const response = await this.request<{ videos: TavusVideoResponse[] }>(`/videos?limit=${limit}`);
    return response.videos || [];
  }

  async deleteVideo(videoId: string): Promise<void> {
    if (!this.apiKey) {
      return Promise.resolve();
    }

    await this.request(`/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Avatar Management
  async createAvatar(name: string, videoFile: File): Promise<TavusAvatar> {
    if (!this.apiKey) {
      // Enhanced mock response for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            avatar_id: `mock_avatar_${Date.now()}`,
            avatar_name: name,
            status: 'training',
            thumbnail_url: 'https://via.placeholder.com/150x150/2ABB63/FFFFFF?text=Avatar',
            created_at: new Date().toISOString(),
            training_progress: 0,
          });
        }, 1000);
      });
    }

    const formData = new FormData();
    formData.append('avatar_name', name);
    formData.append('video', videoFile);
    
    if (this.webhookUrl) {
      formData.append('callback_url', `${this.webhookUrl}/avatar`);
    }

    return this.request<TavusAvatar>('/avatars', {
      method: 'POST',
      body: formData,
    });
  }

  async getAvatar(avatarId: string): Promise<TavusAvatar> {
    if (!this.apiKey) {
      return {
        avatar_id: avatarId,
        avatar_name: 'Mock Avatar',
        status: 'ready',
        thumbnail_url: 'https://via.placeholder.com/150x150/2ABB63/FFFFFF?text=Avatar',
        training_progress: 100,
      };
    }

    return this.request<TavusAvatar>(`/avatars/${avatarId}`);
  }

  async listAvatars(): Promise<TavusAvatar[]> {
    if (!this.apiKey) {
      return [
        {
          avatar_id: 'rca8a38779a8',
          avatar_name: 'ZenKai',
          status: 'ready',
          thumbnail_url: 'https://via.placeholder.com/150x150/3b82f6/FFFFFF?text=ZenKai',
          training_progress: 100,
          persona_id: 'pa34d77a26e9',
          replica_id: 'rca8a38779a8',
        },
        {
          avatar_id: 'default_coach',
          avatar_name: 'Default Coach',
          status: 'ready',
          thumbnail_url: 'https://via.placeholder.com/150x150/ef4444/FFFFFF?text=Coach',
          training_progress: 100,
        },
      ];
    }

    const response = await this.request<{ avatars: TavusAvatar[] }>('/avatars');
    return response.avatars || [];
  }

  async deleteAvatar(avatarId: string): Promise<void> {
    if (!this.apiKey) {
      return Promise.resolve();
    }

    await this.request(`/avatars/${avatarId}`, {
      method: 'DELETE',
    });
  }

  // Voice Cloning
  async createVoiceClone(request: TavusVoiceCloneRequest): Promise<TavusVoiceCloneResponse> {
    if (!this.apiKey) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            voice_id: `mock_voice_${Date.now()}`,
            voice_name: request.voice_name,
            status: 'training',
            training_progress: 0,
            created_at: new Date().toISOString(),
            language: request.language || 'en',
            persona_id: request.base_persona_id,
          });
        }, 1000);
      });
    }

    const formData = new FormData();
    formData.append('voice_name', request.voice_name);
    
    if (request.language) {
      formData.append('language', request.language);
    }

    if (request.base_persona_id) {
      formData.append('base_persona_id', request.base_persona_id);
    }
    
    request.voice_samples.forEach((file, index) => {
      formData.append(`voice_sample_${index}`, file);
    });

    if (this.webhookUrl) {
      formData.append('callback_url', `${this.webhookUrl}/voice`);
    }

    return this.request<TavusVoiceCloneResponse>('/voices', {
      method: 'POST',
      body: formData,
    });
  }

  async getVoiceClone(voiceId: string): Promise<TavusVoiceCloneResponse> {
    if (!this.apiKey) {
      return {
        voice_id: voiceId,
        voice_name: 'Mock Voice',
        status: 'ready',
        training_progress: 100,
        created_at: new Date().toISOString(),
        language: 'en',
      };
    }

    return this.request<TavusVoiceCloneResponse>(`/voices/${voiceId}`);
  }

  async listVoiceClones(): Promise<TavusVoiceCloneResponse[]> {
    if (!this.apiKey) {
      return [];
    }

    const response = await this.request<{ voices: TavusVoiceCloneResponse[] }>('/voices');
    return response.voices || [];
  }

  async deleteVoiceClone(voiceId: string): Promise<void> {
    if (!this.apiKey) {
      return Promise.resolve();
    }

    await this.request(`/voices/${voiceId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  async checkHealth(): Promise<{ status: string; version: string; environment: string }> {
    if (!this.apiKey) {
      return { 
        status: 'mock', 
        version: '1.0.0', 
        environment: 'development' 
      };
    }

    try {
      const response = await this.request<{ status: string; version: string }>('/health');
      return {
        ...response,
        environment: this.environment,
      };
    } catch (error) {
      return {
        status: 'error',
        version: 'unknown',
        environment: this.environment,
      };
    }
  }

  async getQuota(): Promise<{ 
    videos_remaining: number; 
    voice_minutes_remaining: number;
    avatars_remaining: number;
    reset_date: string;
  }> {
    if (!this.apiKey) {
      return { 
        videos_remaining: 100, 
        voice_minutes_remaining: 500,
        avatars_remaining: 10,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return this.request<{ 
      videos_remaining: number; 
      voice_minutes_remaining: number;
      avatars_remaining: number;
      reset_date: string;
    }>('/quota');
  }

  // Get ZenKai configuration
  getZenKaiConfig() {
    return ZENKAI_CONFIG;
  }

  // Webhook verification
  verifyWebhook(payload: string, signature: string, secret: string): boolean {
    if (!secret) return true; // Skip verification if no secret is provided
    
    // Implement webhook signature verification based on Tavus documentation
    // This is a placeholder - implement actual signature verification
    try {
      // Example implementation - replace with actual Tavus webhook verification
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

export const tavusAPI = new TavusAPI();

// Enhanced helper functions with ZenKai-specific implementation
export const generateMentorVideo = async (
  mentorName: string,
  mentorConfig: any,
  script: string,
  voiceSettings?: any
): Promise<TavusVideoResponse> => {
  try {
    // Check if this is ZenKai and use specific configuration
    if (mentorName === 'ZenKai' || mentorConfig?.persona_id === ZENKAI_CONFIG.persona_id) {
      return await tavusAPI.generateZenKaiVideo(script, {
        video_name: `ZenKai Response - ${new Date().toLocaleDateString()}`,
      });
    }

    // For other mentors, use only compatible fields
    const hasAvatarId = mentorConfig?.tavus_avatar_id || mentorConfig?.avatar_id;
    const hasReplicaId = mentorConfig?.replica_id;
    const hasPersonaId = mentorConfig?.persona_id;

    // If we have replica_id and persona_id, use conversations endpoint
    if (hasReplicaId && hasPersonaId) {
      const request: TavusConversationRequest = {
        replica_id: mentorConfig.replica_id,
        persona_id: mentorConfig.persona_id,
        script: script, // Include the script parameter
      };

      return await tavusAPI.request<TavusVideoResponse>('/conversations', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    }

    // Otherwise fall back to videos endpoint if avatar_id is available
    if (hasAvatarId) {
      const request: TavusVideoRequest = {
        avatar_id: mentorConfig.tavus_avatar_id || mentorConfig.avatar_id,
        script,
        video_name: `${mentorName} Response - ${new Date().toLocaleDateString()}`,
      };

      return await tavusAPI.generateVideo(request);
    }

    throw new Error(`No valid avatar configuration found for mentor: ${mentorName}`);
  } catch (error) {
    console.error('Error generating mentor video:', error);
    throw new Error(`Failed to generate video for ${mentorName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createCustomAvatar = async (
  name: string,
  videoFile: File
): Promise<TavusAvatar> => {
  try {
    // Validate file size (max 100MB)
    if (videoFile.size > 100 * 1024 * 1024) {
      throw new Error('Video file must be less than 100MB');
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      throw new Error('File must be a video');
    }

    return await tavusAPI.createAvatar(name, videoFile);
  } catch (error) {
    console.error('Error creating custom avatar:', error);
    throw new Error(`Failed to create avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const cloneVoice = async (
  name: string,
  audioFiles: File[],
  language = 'en',
  basePersonaId?: string
): Promise<TavusVoiceCloneResponse> => {
  try {
    // Validate audio files
    if (audioFiles.length < 3) {
      throw new Error('At least 3 voice samples are required');
    }

    // Validate total duration (minimum 60 seconds)
    const totalDuration = audioFiles.reduce((total, file) => {
      // This is an approximation - actual duration would need to be calculated
      return total + (file.size / 16000); // Rough estimate
    }, 0);

    if (totalDuration < 60) {
      throw new Error('Total voice samples must be at least 60 seconds');
    }

    // Validate file sizes (max 10MB each)
    for (const file of audioFiles) {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Each audio file must be less than 10MB');
      }
      
      if (!file.type.startsWith('audio/')) {
        throw new Error('All files must be audio files');
      }
    }

    return await tavusAPI.createVoiceClone({
      voice_name: name,
      voice_samples: audioFiles,
      language,
      base_persona_id: basePersonaId || ZENKAI_CONFIG.persona_id, // Use ZenKai as base by default
    });
  } catch (error) {
    console.error('Error cloning voice:', error);
    throw new Error(`Failed to clone voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Real-time status polling for long-running operations
export const pollAvatarStatus = async (
  avatarId: string,
  onProgress?: (progress: number) => void,
  onComplete?: (avatar: TavusAvatar) => void,
  onError?: (error: string) => void
): Promise<TavusAvatar> => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const avatar = await tavusAPI.getAvatar(avatarId);
        
        if (avatar.training_progress && onProgress) {
          onProgress(avatar.training_progress);
        }
        
        if (avatar.status === 'ready') {
          if (onComplete) onComplete(avatar);
          resolve(avatar);
        } else if (avatar.status === 'error') {
          const error = avatar.error_message || 'Avatar training failed';
          if (onError) onError(error);
          reject(new Error(error));
        } else {
          // Continue polling
          setTimeout(poll, 5000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (onError) onError(errorMessage);
        reject(error);
      }
    };

    poll();
  });
};

export const pollVideoStatus = async (
  videoId: string,
  onComplete?: (video: TavusVideoResponse) => void,
  onError?: (error: string) => void
): Promise<TavusVideoResponse> => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const video = await tavusAPI.getVideo(videoId);
        
        if (video.status === 'completed') {
          if (onComplete) onComplete(video);
          resolve(video);
        } else if (video.status === 'error') {
          const error = video.error_message || 'Video generation failed';
          if (onError) onError(error);
          reject(new Error(error));
        } else {
          // Continue polling
          setTimeout(poll, 3000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (onError) onError(errorMessage);
        reject(error);
      }
    };

    poll();
  });
};

export const pollVoiceStatus = async (
  voiceId: string,
  onProgress?: (progress: number) => void,
  onComplete?: (voice: TavusVoiceCloneResponse) => void,
  onError?: (error: string) => void
): Promise<TavusVoiceCloneResponse> => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const voice = await tavusAPI.getVoiceClone(voiceId);
        
        if (voice.training_progress && onProgress) {
          onProgress(voice.training_progress);
        }
        
        if (voice.status === 'ready') {
          if (onComplete) onComplete(voice);
          resolve(voice);
        } else if (voice.status === 'error') {
          const error = voice.error_message || 'Voice training failed';
          if (onError) onError(error);
          reject(new Error(error));
        } else {
          // Continue polling
          setTimeout(poll, 5000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (onError) onError(errorMessage);
        reject(error);
      }
    };

    poll();
  });
};