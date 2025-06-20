// Supabase integration for Tavus conversations

import { supabase } from './supabase';

export interface TavusConversation {
  id: string;
  user_id: string;
  mentor_id: string;
  tavus_conversation_id?: string;
  conversation_url?: string;
  status: 'creating' | 'active' | 'ended' | 'error';
  conversation_name?: string;
  conversational_context?: string;
  custom_greeting?: string;
  properties: any;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  mentor?: any;
}

export interface ConversationEvent {
  id: string;
  conversation_id: string;
  event_type: 'created' | 'joined' | 'left' | 'message' | 'ended' | 'error';
  event_data: any;
  created_at: string;
}

// Conversation management
export const tavusConversations = {
  // Create a new conversation record
  create: async (conversationData: {
    user_id: string;
    mentor_id: string;
    conversation_name?: string;
    conversational_context?: string;
    custom_greeting?: string;
    properties?: any;
  }): Promise<{ data: TavusConversation | null; error: any }> => {
    const { data, error } = await supabase
      .from('tavus_conversations')
      .insert({
        ...conversationData,
        status: 'creating',
        properties: conversationData.properties || {},
      })
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  // Update conversation with Tavus details
  updateWithTavusData: async (
    id: string, 
    tavusData: {
      tavus_conversation_id: string;
      conversation_url: string;
      status?: string;
      started_at?: string;
    }
  ): Promise<{ data: TavusConversation | null; error: any }> => {
    const { data, error } = await supabase
      .from('tavus_conversations')
      .update({
        ...tavusData,
        status: tavusData.status || 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  // Get conversation by ID
  getById: async (id: string): Promise<{ conversation: TavusConversation | null; error: any }> => {
    const { data: conversation, error } = await supabase
      .from('tavus_conversations')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('id', id)
      .single();
    
    return { conversation, error };
  },

  // Get conversations by user
  getByUser: async (
    userId: string, 
    limit = 20
  ): Promise<{ conversations: TavusConversation[]; error: any }> => {
    const { data: conversations, error } = await supabase
      .from('tavus_conversations')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { conversations: conversations || [], error };
  },

  // Get active conversations by user
  getActiveByUser: async (userId: string): Promise<{ conversations: TavusConversation[]; error: any }> => {
    const { data: conversations, error } = await supabase
      .from('tavus_conversations')
      .select(`
        *,
        mentor:mentors(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    return { conversations: conversations || [], error };
  },

  // End conversation
  end: async (id: string): Promise<{ data: TavusConversation | null; error: any }> => {
    const { data, error } = await supabase
      .from('tavus_conversations')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  // Update conversation status
  updateStatus: async (
    id: string, 
    status: 'creating' | 'active' | 'ended' | 'error',
    additionalData?: any
  ): Promise<{ data: TavusConversation | null; error: any }> => {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData,
    };

    if (status === 'ended' && !additionalData?.ended_at) {
      updateData.ended_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tavus_conversations')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        mentor:mentors(*)
      `)
      .single();
    
    return { data, error };
  },

  // Calculate duration for ended conversations
  calculateDuration: async (id: string): Promise<{ duration: number; error: any }> => {
    const { data: conversation, error } = await supabase
      .from('tavus_conversations')
      .select('started_at, ended_at')
      .eq('id', id)
      .single();

    if (error || !conversation?.started_at || !conversation?.ended_at) {
      return { duration: 0, error };
    }

    const startTime = new Date(conversation.started_at).getTime();
    const endTime = new Date(conversation.ended_at).getTime();
    const duration = Math.round((endTime - startTime) / 1000);

    // Update the duration in the database
    await supabase
      .from('tavus_conversations')
      .update({ duration_seconds: duration })
      .eq('id', id);

    return { duration, error: null };
  },
};

// Conversation events management
export const conversationEvents = {
  // Add event
  create: async (eventData: {
    conversation_id: string;
    event_type: 'created' | 'joined' | 'left' | 'message' | 'ended' | 'error';
    event_data?: any;
  }): Promise<{ data: ConversationEvent | null; error: any }> => {
    const { data, error } = await supabase
      .from('conversation_events')
      .insert({
        ...eventData,
        event_data: eventData.event_data || {},
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Get events for conversation
  getByConversation: async (conversationId: string): Promise<{ events: ConversationEvent[]; error: any }> => {
    const { data: events, error } = await supabase
      .from('conversation_events')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    return { events: events || [], error };
  },

  // Subscribe to conversation events
  subscribeToConversation: (conversationId: string, callback: (event: ConversationEvent) => void) => {
    return supabase
      .channel(`conversation_events:conversation_id=eq.${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_events',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        callback(payload.new as ConversationEvent);
      })
      .subscribe();
  },
};

// Analytics and insights
export const conversationAnalytics = {
  // Get user conversation stats
  getUserStats: async (userId: string): Promise<{
    totalConversations: number;
    activeConversations: number;
    totalDuration: number;
    avgDuration: number;
    mentorUsage: { [key: string]: number };
    error: any;
  }> => {
    try {
      const { data: conversations, error } = await supabase
        .from('tavus_conversations')
        .select(`
          duration_seconds,
          status,
          mentor:mentors(name)
        `)
        .eq('user_id', userId);

      if (error) {
        return {
          totalConversations: 0,
          activeConversations: 0,
          totalDuration: 0,
          avgDuration: 0,
          mentorUsage: {},
          error,
        };
      }

      const totalConversations = conversations?.length || 0;
      const activeConversations = conversations?.filter(c => c.status === 'active').length || 0;
      const totalDuration = conversations?.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) || 0;
      const avgDuration = totalConversations > 0 ? Math.round(totalDuration / totalConversations) : 0;

      const mentorUsage: { [key: string]: number } = {};
      conversations?.forEach(conversation => {
        const mentorName = conversation.mentor?.name || 'Unknown';
        mentorUsage[mentorName] = (mentorUsage[mentorName] || 0) + 1;
      });

      return {
        totalConversations,
        activeConversations,
        totalDuration,
        avgDuration,
        mentorUsage,
        error: null,
      };
    } catch (error) {
      return {
        totalConversations: 0,
        activeConversations: 0,
        totalDuration: 0,
        avgDuration: 0,
        mentorUsage: {},
        error,
      };
    }
  },
};