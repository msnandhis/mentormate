// AI Mentor Integration Library
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface AIMentorRequest {
  mentor: {
    id: string;
    name: string;
    category: string;
    personality: string;
    speaking_style: string;
    motivation_approach: string;
    prompt_template: string;
    response_style: any;
  };
  user_message: string;
  context: {
    mood_score?: number;
    goals?: any[];
    reflection?: string;
    streak?: number;
    conversation_history?: any[];
    user_id?: string;
  };
  session_type: 'checkin' | 'chat' | 'conversation';
}

export interface AIMentorResponse {
  success: boolean;
  response: string;
  metadata: {
    model: string;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    mentor_name: string;
    session_type: string;
    is_fallback?: boolean;
    error?: string;
  };
}

class AIMentorService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1/ai-mentor`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };
  }

  async generateResponse(request: AIMentorRequest): Promise<AIMentorResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Mentor Service error:', error);
      
      // Return fallback response
      return {
        success: true,
        response: this.generateLocalFallback(request),
        metadata: {
          model: 'local_fallback',
          mentor_name: request.mentor.name,
          session_type: request.session_type,
          is_fallback: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private generateLocalFallback(request: AIMentorRequest): string {
    const { mentor, context, session_type } = request;

    // Mentor-specific fallback responses
    const mentorResponses = {
      'ZenKai': [
        "Thank you for sharing that with me. Take a deep breath and remember that every moment is a new beginning. How are you feeling right now?",
        "I appreciate your openness. Let's approach this with mindfulness and compassion. What would bring you peace in this moment?",
        "Your awareness is beautiful. Remember, progress isn't about perfection—it's about presence. What intention would you like to set?",
      ],
      'Coach Lex': [
        "That's the spirit! I love hearing about your journey. You're building real momentum here! What's your next challenge? 💪",
        "YES! You're showing up and that's what matters! Keep that energy flowing. How can we level up your game today?",
        "Amazing work! Every step forward counts, no matter how small. What victory are we celebrating next?",
      ],
      'Prof. Ada': [
        "Excellent insight! Let's analyze this systematically. I can see you're thinking critically about your approach. What patterns do you notice?",
        "That's valuable data you've shared. Let's break this down into actionable components. What's the next logical step in your strategy?",
        "Great observation! Your analytical thinking is improving. How does this connect to your larger learning objectives?",
      ],
      'No-BS Tony': [
        "Alright, let's cut to the chase. I hear what you're saying, but what specific action are you going to take about it?",
        "Good. Now stop thinking and start doing. What's your concrete next step and when are you going to execute it?",
        "I appreciate the honesty. Results speak louder than words. What measurable outcome are you committing to this week?",
      ],
    };

    const responses = mentorResponses[mentor.name as keyof typeof mentorResponses] || [
      "Thank you for sharing that. I'm here to support you on your journey. How can I help you move forward?",
      "I hear you, and I appreciate your commitment to growth. What's one thing you can do right now to progress?",
      "That's valuable insight. Let's focus on what you can control and take meaningful action.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Helper method to format conversation history
  formatConversationHistory(messages: any[]): any[] {
    return messages.slice(-5).map(msg => ({
      sender_type: msg.sender_type,
      content: msg.content,
      created_at: msg.created_at,
    }));
  }

  // Helper method to build context for check-ins
  buildCheckinContext(checkinData: {
    mood_score: number;
    goals: any[];
    reflection?: string;
    streak?: number;
  }) {
    return {
      mood_score: checkinData.mood_score,
      goals: checkinData.goals,
      reflection: checkinData.reflection,
      streak: checkinData.streak,
    };
  }
}

export const aiMentorService = new AIMentorService();

// Enhanced mentor response generation for check-ins
export const generateAIMentorResponse = async (
  mentor: any,
  checkinData: {
    mood_score: number;
    goals: any[];
    reflection?: string;
    streak?: number;
    user_id?: string;
  }
): Promise<string> => {
  try {
    const request: AIMentorRequest = {
      mentor: {
        id: mentor.id,
        name: mentor.name,
        category: mentor.category,
        personality: mentor.personality || '',
        speaking_style: mentor.speaking_style || '',
        motivation_approach: mentor.motivation_approach || '',
        prompt_template: mentor.prompt_template || '',
        response_style: mentor.response_style || {},
      },
      user_message: `User completed a daily check-in with mood score ${checkinData.mood_score}/10, goals status, and reflection.`,
      context: aiMentorService.buildCheckinContext(checkinData),
      session_type: 'checkin',
    };

    const response = await aiMentorService.generateResponse(request);
    return response.response;
  } catch (error) {
    console.error('Error generating AI mentor response:', error);
    return `Thank you for checking in! I'm here to support your journey. Your commitment to tracking your progress shows real dedication.`;
  }
};

// Enhanced chat response generation
export const generateAIChatResponse = async (
  mentor: any,
  userMessage: string,
  conversationHistory: any[] = [],
  userId?: string
): Promise<string> => {
  try {
    const request: AIMentorRequest = {
      mentor: {
        id: mentor.id,
        name: mentor.name,
        category: mentor.category,
        personality: mentor.personality || '',
        speaking_style: mentor.speaking_style || '',
        motivation_approach: mentor.motivation_approach || '',
        prompt_template: mentor.prompt_template || '',
        response_style: mentor.response_style || {},
      },
      user_message: userMessage,
      context: {
        conversation_history: aiMentorService.formatConversationHistory(conversationHistory),
        user_id: userId,
      },
      session_type: 'chat',
    };

    const response = await aiMentorService.generateResponse(request);
    return response.response;
  } catch (error) {
    console.error('Error generating AI chat response:', error);
    return `I'm here to help! Could you tell me more about what's on your mind?`;
  }
};