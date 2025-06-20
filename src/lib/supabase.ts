import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || supabaseUrl.includes('your-project-id')) {
  throw new Error('Invalid Supabase URL. Please update VITE_SUPABASE_URL in your .env file with your actual Supabase project URL (e.g., https://your-project-id.supabase.co)');
}

// Validate anon key format
if (supabaseKey.includes('your-anon-key-here')) {
  throw new Error('Invalid Supabase anon key. Please update VITE_SUPABASE_ANON_KEY in your .env file with your actual Supabase anon key.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types
export interface Mentor {
  id: string;
  name: string;
  category: string;
  tone: string;
  tavus_avatar_id?: string;
  description: string;
  is_custom: boolean;
  personality?: string;
  gradient?: string;
  expertise?: string[];
  speaking_style?: string;
  motivation_approach?: string;
  prompt_template?: string;
  response_style?: {
    tone: string;
    emoji_use: string;
    encouragement_level: string;
    challenge_level: string;
  };
  avatar_config?: {
    appearance: string;
    clothing: string;
    background: string;
    energy: string;
  };
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  default_mentor_id?: string;
  custom_voice_id?: string;
  preferred_mode: 'classic' | 'realtime';
  onboarding_completed: boolean;
  active_custom_avatar_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  text: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GoalStatus {
  goal_id: string;
  goal_text: string;
  completed: boolean;
  notes?: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  mentor_id: string;
  mode: 'classic' | 'realtime';
  mood_score: number;
  reflection?: string;
  goal_status: GoalStatus[];
  emotion_score?: number;
  video_url?: string;
  created_at: string;
  updated_at: string;
  mentor?: Mentor;
}

export interface MentorResponse {
  id: string;
  checkin_id: string;
  mentor_id: string;
  user_id: string;
  prompt_data: {
    mood_score: number;
    goals: GoalStatus[];
    reflection?: string;
    user_context?: any;
  };
  response_text: string;
  response_metadata?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    model_used?: string;
  };
  tavus_video_id?: string;
  video_url?: string;
  video_generation_id?: string;
  generation_time_ms?: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  mentor_id: string;
  session_type: 'text' | 'voice' | 'video';
  status: 'active' | 'paused' | 'ended';
  duration_seconds: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  mentor?: Mentor;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'user' | 'mentor' | 'system';
  message_type: 'text' | 'voice' | 'system';
  content: string;
  voice_url?: string;
  duration_ms?: number;
  metadata?: any;
  created_at: string;
}

export interface CustomAvatar {
  id: string;
  user_id: string;
  name: string;
  tavus_avatar_id?: string;
  status: 'creating' | 'training' | 'ready' | 'failed';
  avatar_type: 'standard' | 'voice_clone' | 'custom';
  configuration: any;
  training_data: any;
  sample_video_url?: string;
  preview_video_url?: string;
  voice_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceSample {
  id: string;
  user_id: string;
  custom_avatar_id?: string;
  file_name: string;
  file_url: string;
  duration_seconds?: number;
  transcription?: string;
  quality_score?: number;
  status: 'processing' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export interface VideoGeneration {
  id: string;
  user_id: string;
  checkin_id?: string;
  mentor_response_id?: string;
  avatar_id: string;
  script_text: string;
  tavus_request_id?: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  generation_time_ms?: number;
  error_message?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Profile helpers
export const profiles = {
  get: async (userId: string): Promise<{ profile: UserProfile | null; error: any }> => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { profile, error };
  },

  update: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  completeOnboarding: async (userId: string, mentorId: string, preferredMode: 'classic' | 'realtime') => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        default_mentor_id: mentorId,
        preferred_mode: preferredMode,
        onboarding_completed: true,
      })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },
};

// Enhanced Mentor helpers with category-specific logic
export const mentors = {
  getAll: async (): Promise<{ mentors: Mentor[]; error: any }> => {
    const { data: mentors, error } = await supabase
      .from('mentors')
      .select('*')
      .order('created_at');
    
    return { mentors: mentors || [], error };
  },

  getByCategory: async (category: string): Promise<{ mentors: Mentor[]; error: any }> => {
    const { data: mentors, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('category', category)
      .eq('is_custom', false)
      .order('created_at');
    
    return { mentors: mentors || [], error };
  },

  getById: async (id: string): Promise<{ mentor: Mentor | null; error: any }> => {
    const { data: mentor, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', id)
      .single();
    
    return { mentor, error };
  },

  getCustomMentors: async (userId: string): Promise<{ mentors: Mentor[]; error: any }> => {
    const { data: mentors, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('is_custom', true)
      .order('created_at');
    
    return { mentors: mentors || [], error };
  },

  generatePrompt: (mentor: Mentor, checkinData: {
    mood_score: number;
    goals: GoalStatus[];
    reflection?: string;
    streak?: number;
  }): string => {
    const { mood_score, goals, reflection, streak } = checkinData;
    
    // Base context
    let context = `User Check-in Data:
- Mood: ${mood_score}/10
- Goals completed: ${goals.filter(g => g.completed).length}/${goals.length}`;
    
    if (reflection) {
      context += `\n- Reflection: "${reflection}"`;
    }
    
    if (streak && streak > 0) {
      context += `\n- Current streak: ${streak} days`;
    }
    
    // Goal details
    if (goals.length > 0) {
      context += '\n\nGoal Details:';
      goals.forEach(goal => {
        context += `\n- ${goal.goal_text}: ${goal.completed ? '✅ Completed' : '❌ Not completed'}`;
        if (goal.notes) {
          context += ` (Note: ${goal.notes})`;
        }
      });
    }
    
    // Mentor-specific prompt template
    const template = mentor.prompt_template || 'You are a supportive AI mentor. Provide encouraging, personalized advice based on the user\'s check-in. Keep responses under 150 words.';
    
    return `${template}

${context}

Please provide a personalized response that:
1. Acknowledges their current mood and progress
2. ${mentor.category === 'fitness' ? 'Focuses on physical health and movement' :
      mentor.category === 'wellness' ? 'Emphasizes mental well-being and balance' :
      mentor.category === 'study' ? 'Supports learning and productivity goals' :
      mentor.category === 'career' ? 'Addresses professional growth and achievement' :
      'Provides general encouragement and support'}
3. Offers specific, actionable advice for tomorrow
4. Matches the tone and style of ${mentor.name}`;
  },

  generateChatPrompt: (mentor: Mentor, conversationContext: string): string => {
    const basePrompt = mentor.prompt_template || 'You are a supportive AI mentor having a real-time conversation.';
    
    return `${basePrompt}

Conversation Context:
${conversationContext}

Guidelines for this real-time conversation:
1. Respond naturally and conversationally as ${mentor.name}
2. Keep responses concise but meaningful (1-3 sentences typically)
3. Ask follow-up questions to deepen the conversation
4. ${mentor.category === 'fitness' ? 'Focus on physical health, movement, and energy' :
      mentor.category === 'wellness' ? 'Emphasize mindfulness, balance, and emotional well-being' :
      mentor.category === 'study' ? 'Support learning, productivity, and academic goals' :
      mentor.category === 'career' ? 'Address professional development and achievement' :
      'Provide personalized support and guidance'}
5. Match the personality: ${mentor.personality}
6. Use the speaking style: ${mentor.speaking_style}

Be engaging, authentic, and helpful in your response.`;
  },
};

// Goal helpers
export const goals = {
  getAll: async (userId: string): Promise<{ goals: Goal[]; error: any }> => {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at');
    
    return { goals: goals || [], error };
  },

  create: async (userId: string, text: string) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        text,
      })
      .select()
      .single();
    
    return { data, error };
  },

  update: async (goalId: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();
    
    return { data, error };
  },

  delete: async (goalId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .update({ is_active: false })
      .eq('id', goalId);
    
    return { data, error };
  },

  createMultiple: async (userId: string, goalTexts: string[]) => {
    const goalData = goalTexts.map(text => ({
      user_id: userId,
      text,
    }));

    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select();
    
    return { data, error };
  },
};

// Enhanced Check-in helpers with mentor integration
export const checkins = {
  getAll: async (userId: string, limit = 20): Promise<{ checkins: Checkin[]; error: any }> => {
    const { data: checkins, error } = await supabase
      .from('checkins')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { checkins: checkins || [], error };
  },

  create: async (checkinData: {
    user_id: string;
    mentor_id: string;
    mode: 'classic' | 'realtime';
    mood_score: number;
    reflection?: string;
    goal_status: GoalStatus[];
    emotion_score?: number;
  }) => {
    const { data, error } = await supabase
      .from('checkins')
      .insert(checkinData)
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  getByMentor: async (userId: string, mentorId: string, limit = 10): Promise<{ checkins: Checkin[]; error: any }> => {
    const { data: checkins, error } = await supabase
      .from('checkins')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('user_id', userId)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { checkins: checkins || [], error };
  },

  getStreak: async (userId: string): Promise<{ streak: number; error: any }> => {
    const { data: checkins, error } = await supabase
      .from('checkins')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { streak: 0, error };

    // Calculate streak by counting consecutive days
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(today);
    
    for (const checkin of checkins || []) {
      const checkinDate = new Date(checkin.created_at);
      checkinDate.setHours(0, 0, 0, 0);
      
      if (checkinDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkinDate.getTime() < currentDate.getTime()) {
        // Found a gap in the streak
        break;
      }
    }
    
    return { streak, error: null };
  },

  getWeeklyStats: async (userId: string): Promise<{ 
    totalCheckins: number; 
    avgMood: number; 
    avgEmotion: number;
    completionRate: number;
    mentorUsage: { [key: string]: number };
    error: any 
  }> => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: checkins, error } = await supabase
      .from('checkins')
      .select(`
        mood_score, 
        emotion_score, 
        goal_status,
        mentor:mentors(name)
      `)
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    if (error) return { 
      totalCheckins: 0, 
      avgMood: 0, 
      avgEmotion: 0, 
      completionRate: 0, 
      mentorUsage: {},
      error 
    };

    const totalCheckins = checkins?.length || 0;
    const avgMood = totalCheckins > 0 
      ? Math.round(checkins!.reduce((sum, c) => sum + c.mood_score, 0) / totalCheckins)
      : 0;
    
    const emotionScores = checkins?.filter(c => c.emotion_score).map(c => c.emotion_score) || [];
    const avgEmotion = emotionScores.length > 0
      ? Math.round(emotionScores.reduce((sum, score) => sum + score, 0) / emotionScores.length)
      : 0;

    // Calculate goal completion rate
    let totalGoals = 0;
    let completedGoals = 0;
    
    checkins?.forEach(checkin => {
      const goals = checkin.goal_status as GoalStatus[];
      totalGoals += goals.length;
      completedGoals += goals.filter(g => g.completed).length;
    });
    
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Calculate mentor usage
    const mentorUsage: { [key: string]: number } = {};
    checkins?.forEach(checkin => {
      const mentorName = checkin.mentor?.name || 'Unknown';
      mentorUsage[mentorName] = (mentorUsage[mentorName] || 0) + 1;
    });

    return { totalCheckins, avgMood, avgEmotion, completionRate, mentorUsage, error: null };
  },
};

// Mentor Response helpers with video support
export const mentorResponses = {
  create: async (responseData: {
    checkin_id: string;
    mentor_id: string;
    user_id: string;
    prompt_data: any;
    response_text: string;
    response_metadata?: any;
    tavus_video_id?: string;
    video_url?: string;
    video_generation_id?: string;
    generation_time_ms?: number;
  }) => {
    const { data, error } = await supabase
      .from('mentor_responses')
      .insert(responseData)
      .select()
      .single();
    
    return { data, error };
  },

  getByCheckin: async (checkinId: string): Promise<{ response: MentorResponse | null; error: any }> => {
    const { data: response, error } = await supabase
      .from('mentor_responses')
      .select('*')
      .eq('checkin_id', checkinId)
      .single();
    
    return { response, error };
  },

  getByUser: async (userId: string, limit = 20): Promise<{ responses: MentorResponse[]; error: any }> => {
    const { data: responses, error } = await supabase
      .from('mentor_responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { responses: responses || [], error };
  },
};

// Custom Avatar helpers
export const customAvatars = {
  getAll: async (userId: string): Promise<{ avatars: CustomAvatar[]; error: any }> => {
    const { data: avatars, error } = await supabase
      .from('custom_avatars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { avatars: avatars || [], error };
  },

  create: async (avatarData: {
    user_id: string;
    name: string;
    avatar_type: 'standard' | 'voice_clone' | 'custom';
    configuration?: any;
    training_data?: any;
    tavus_avatar_id?: string;
    voice_id?: string;
  }) => {
    const { data, error } = await supabase
      .from('custom_avatars')
      .insert(avatarData)
      .select()
      .single();
    
    return { data, error };
  },

  update: async (avatarId: string, updates: Partial<CustomAvatar>) => {
    const { data, error } = await supabase
      .from('custom_avatars')
      .update(updates)
      .eq('id', avatarId)
      .select()
      .single();
    
    return { data, error };
  },

  delete: async (avatarId: string) => {
    const { data, error } = await supabase
      .from('custom_avatars')
      .delete()
      .eq('id', avatarId);
    
    return { data, error };
  },
};

// Voice Sample helpers
export const voiceSamples = {
  create: async (sampleData: {
    user_id: string;
    custom_avatar_id?: string;
    file_name: string;
    file_url: string;
    duration_seconds?: number;
    transcription?: string;
  }) => {
    const { data, error } = await supabase
      .from('voice_samples')
      .insert(sampleData)
      .select()
      .single();
    
    return { data, error };
  },

  getByAvatar: async (avatarId: string): Promise<{ samples: VoiceSample[]; error: any }> => {
    const { data: samples, error } = await supabase
      .from('voice_samples')
      .select('*')
      .eq('custom_avatar_id', avatarId)
      .order('created_at');
    
    return { samples: samples || [], error };
  },

  update: async (sampleId: string, updates: Partial<VoiceSample>) => {
    const { data, error } = await supabase
      .from('voice_samples')
      .update(updates)
      .eq('id', sampleId)
      .select()
      .single();
    
    return { data, error };
  },
};

// Video Generation helpers
export const videoGenerations = {
  create: async (generationData: {
    user_id: string;
    checkin_id?: string;
    mentor_response_id?: string;
    avatar_id: string;
    script_text: string;
    tavus_request_id?: string;
    metadata?: any;
  }) => {
    const { data, error } = await supabase
      .from('video_generations')
      .insert(generationData)
      .select()
      .single();
    
    return { data, error };
  },

  update: async (generationId: string, updates: Partial<VideoGeneration>) => {
    const { data, error } = await supabase
      .from('video_generations')
      .update(updates)
      .eq('id', generationId)
      .select()
      .single();
    
    return { data, error };
  },

  getByUser: async (userId: string, limit = 20): Promise<{ generations: VideoGeneration[]; error: any }> => {
    const { data: generations, error } = await supabase
      .from('video_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { generations: generations || [], error };
  },

  getByCheckin: async (checkinId: string): Promise<{ generation: VideoGeneration | null; error: any }> => {
    const { data: generation, error } = await supabase
      .from('video_generations')
      .select('*')
      .eq('checkin_id', checkinId)
      .single();
    
    return { generation, error };
  },
};

// Real-time Chat helpers
export const chatSessions = {
  create: async (sessionData: {
    user_id: string;
    mentor_id: string;
    session_type: 'text' | 'voice' | 'video';
  }) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  getById: async (sessionId: string): Promise<{ session: ChatSession | null; error: any }> => {
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('id', sessionId)
      .single();
    
    return { session, error };
  },

  getByUser: async (userId: string, limit = 10): Promise<{ sessions: ChatSession[]; error: any }> => {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { sessions: sessions || [], error };
  },

  update: async (sessionId: string, updates: Partial<ChatSession>) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  end: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    return { data, error };
  },
};

export const chatMessages = {
  create: async (messageData: {
    session_id: string;
    sender_type: 'user' | 'mentor' | 'system';
    message_type: 'text' | 'voice' | 'system';
    content: string;
    voice_url?: string;
    duration_ms?: number;
    metadata?: any;
  }) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();
    
    return { data, error };
  },

  getBySession: async (sessionId: string): Promise<{ messages: ChatMessage[]; error: any }> => {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    return { messages: messages || [], error };
  },

  subscribeToSession: (sessionId: string, callback: (message: ChatMessage) => void) => {
    return supabase
      .channel(`chat_messages:session_id=eq.${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        callback(payload.new as ChatMessage);
      })
      .subscribe();
  },
};