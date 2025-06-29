// Tavus Conversational Video Interface integration

const TAVUS_API_URL = 'https://tavusapi.com/v2';
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || '';

export interface TavusConversationRequest {
  replica_id: string;
  persona_id: string;
  callback_url?: string;
  conversation_name?: string;
  conversational_context?: string;
  custom_greeting?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_closed_captions?: boolean;
    apply_greenscreen?: boolean;
    language?: string;
    recording_s3_bucket_name?: string;
    recording_s3_bucket_region?: string;
    aws_assume_role_arn?: string;
  };
}

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_name: string;
  status: 'active' | 'ended';
  conversation_url: string;
  replica_id: string;
  persona_id: string;
  created_at: string;
}

export interface TavusConversationDetails extends TavusConversationResponse {
  callback_url?: string;
  updated_at: string;
}

class TavusConversationsAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = TAVUS_API_KEY;
    this.baseUrl = TAVUS_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your .env file.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
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

  // Create a new conversation
  async createConversation(request: TavusConversationRequest): Promise<TavusConversationResponse> {
    if (!this.apiKey) {
      // Mock response for development
      return {
        conversation_id: `mock_conv_${Date.now()}`,
        conversation_name: request.conversation_name || 'Mock Conversation',
        status: 'active',
        conversation_url: `https://tavus.daily.co/mock_conv_${Date.now()}`,
        replica_id: request.replica_id,
        persona_id: request.persona_id,
        created_at: new Date().toISOString(),
      };
    }

    const cleanedRequest = this.cleanRequest(request);
    return this.request<TavusConversationResponse>('/conversations', {
      method: 'POST',
      body: JSON.stringify(cleanedRequest),
    });
  }

  // Get conversation details
  async getConversation(conversationId: string): Promise<TavusConversationDetails> {
    if (!this.apiKey) {
      return {
        conversation_id: conversationId,
        conversation_name: 'Mock Conversation',
        status: 'active',
        conversation_url: `https://tavus.daily.co/${conversationId}`,
        replica_id: 'mock_replica',
        persona_id: 'mock_persona',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return this.request<TavusConversationDetails>(`/conversations/${conversationId}`);
  }

  // End a conversation
  async endConversation(conversationId: string): Promise<void> {
    if (!this.apiKey) {
      return Promise.resolve();
    }

    await this.request(`/conversations/${conversationId}/end`, {
      method: 'POST',
    });
  }

  // List conversations (if available)
  async listConversations(limit = 50): Promise<TavusConversationResponse[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await this.request<{ conversations: TavusConversationResponse[] }>(`/conversations?limit=${limit}`);
      return response.conversations || [];
    } catch (error) {
      // If endpoint doesn't exist, return empty array
      console.warn('List conversations endpoint not available:', error);
      return [];
    }
  }

  // Helper function to clean request object
  private cleanRequest(request: any): any {
    const cleaned: any = {};
    Object.keys(request).forEach(key => {
      if (request[key] !== undefined && request[key] !== null) {
        cleaned[key] = request[key];
      }
    });
    return cleaned;
  }

  // Check if API is configured
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }
}

export const tavusConversationsAPI = new TavusConversationsAPI();

// Helper functions for mentor-specific conversation creation
export const createMentorConversation = async (
  mentor: any,
  userName?: string,
  customContext?: string
): Promise<TavusConversationResponse> => {
  const mentorConfig = mentor.avatar_config || {};
  
  if (!mentorConfig.replica_id || !mentorConfig.persona_id) {
    throw new Error(`Mentor ${mentor.name} is not configured for live conversations. Missing replica_id or persona_id.`);
  }

  const greeting = generateCustomGreeting(mentor, userName);
  const context = generateConversationalContext(mentor, customContext);

  const request: TavusConversationRequest = {
    replica_id: mentorConfig.replica_id,
    persona_id: mentorConfig.persona_id,
    conversation_name: `Live Chat with ${mentor.name}`,
    conversational_context: context,
    custom_greeting: greeting,
    properties: {
      max_call_duration: 3600, // 1 hour
      participant_left_timeout: 60,
      participant_absent_timeout: 300,
      enable_recording: false, // Can be enabled based on user preference
      enable_closed_captions: true,
      language: 'english',
    },
  };

  return tavusConversationsAPI.createConversation(request);
};

const generateCustomGreeting = (mentor: any, userName?: string): string => {
  const name = userName || 'there';
  
  const greetings = {
    'ZenKai': `Hello ${name}, and welcome to our mindful space. I'm ZenKai, and I'm here to help you find balance and peace in this moment. Take a deep breath, and let's explore your wellness journey together.`,
    'Coach Lex': `Hey ${name}! 💪 I'm Coach Lex, your fitness mentor! I'm pumped to be here with you today. Ready to crush some goals and get moving? Let's make this session amazing!`,
    'Prof. Sophia': `Greetings ${name}! I'm Professor Sophia, your study and productivity mentor. I'm here to help you optimize your learning strategies and achieve your academic goals. What would you like to focus on today?`,
    'Dr. Maya': `Hello ${name}, I'm Dr. Maya. It's great to meet you. I'm here to help you navigate your career journey with clarity and purpose. Let's discuss what professional goals you'd like to work toward.`
  };

  return greetings[mentor.name as keyof typeof greetings] || 
         `Hello ${name}! I'm ${mentor.name}, your ${mentor.category} mentor. I'm excited to have this live conversation with you. How can I support your goals today?`;
};

const generateConversationalContext = (mentor: any, customContext?: string): string => {
  const baseContext = `You are ${mentor.name}, a ${mentor.category} mentor with expertise in ${mentor.expertise?.join(', ') || mentor.category}. 

Your personality: ${mentor.personality || 'supportive and encouraging'}
Your speaking style: ${mentor.speaking_style || 'conversational and helpful'}
Your approach: ${mentor.motivation_approach || 'supportive guidance'}

Keep responses conversational, engaging, and focused on helping the user achieve their goals. Ask follow-up questions to understand their needs better.`;

  if (customContext) {
    return `${baseContext}\n\nAdditional context: ${customContext}`;
  }

  return baseContext;
};

// Conversation status polling
export const pollConversationStatus = async (
  conversationId: string,
  onStatusChange?: (status: string) => void,
  onError?: (error: string) => void
): Promise<TavusConversationDetails> => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const conversation = await tavusConversationsAPI.getConversation(conversationId);
        
        if (onStatusChange) {
          onStatusChange(conversation.status);
        }
        
        if (conversation.status === 'ended') {
          resolve(conversation);
        } else if (conversation.status === 'active') {
          // Continue polling every 5 seconds
          setTimeout(poll, 5000);
        } else {
          // Continue polling for other statuses
          setTimeout(poll, 2000);
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