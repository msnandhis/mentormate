import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface MentorRequest {
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
  };
  session_type: 'checkin' | 'chat' | 'conversation';
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { mentor, user_message, context, session_type }: MentorRequest = await req.json();

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation history for context
    const messages: OpenAIMessage[] = [];

    // System prompt with mentor persona
    const systemPrompt = buildSystemPrompt(mentor, context, session_type);
    messages.push({
      role: 'system',
      content: systemPrompt
    });

    // Add conversation history for context (last 5 messages)
    if (context.conversation_history && context.conversation_history.length > 0) {
      const recentHistory = context.conversation_history.slice(-5);
      
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: user_message
    });

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the latest efficient model
        messages: messages,
        max_tokens: session_type === 'chat' ? 200 : 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await openaiResponse.json();
    const mentorResponse = aiResponse.choices[0]?.message?.content;

    if (!mentorResponse) {
      throw new Error('No response generated from AI');
    }

    return new Response(JSON.stringify({
      success: true,
      response: mentorResponse.trim(),
      metadata: {
        model: 'gpt-4o-mini',
        prompt_tokens: aiResponse.usage?.prompt_tokens,
        completion_tokens: aiResponse.usage?.completion_tokens,
        total_tokens: aiResponse.usage?.total_tokens,
        mentor_name: mentor.name,
        session_type: session_type,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Mentor error:", error);
    
    // Fallback to persona-based responses if AI fails
    const fallbackResponse = generateFallbackResponse(req.body);
    
    return new Response(JSON.stringify({
      success: true,
      response: fallbackResponse,
      metadata: {
        model: 'fallback',
        is_fallback: true,
        error: error.message,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildSystemPrompt(mentor: any, context: any, sessionType: string): string {
  let systemPrompt = mentor.prompt_template || 
    `You are ${mentor.name}, a ${mentor.category} mentor. Respond helpfully and in character.`;

  // Add mentor personality details
  systemPrompt += `\n\nYour Personality: ${mentor.personality || 'supportive and encouraging'}`;
  systemPrompt += `\nYour Speaking Style: ${mentor.speaking_style || 'conversational and helpful'}`;
  systemPrompt += `\nYour Motivation Approach: ${mentor.motivation_approach || 'balanced support and challenge'}`;

  // Add response style guidelines
  if (mentor.response_style) {
    const style = mentor.response_style;
    systemPrompt += `\nResponse Guidelines:`;
    systemPrompt += `\n- Tone: ${style.tone || 'supportive'}`;
    systemPrompt += `\n- Emoji use: ${style.emoji_use || 'moderate'}`;
    systemPrompt += `\n- Encouragement level: ${style.encouragement_level || 'medium'}`;
    systemPrompt += `\n- Challenge level: ${style.challenge_level || 'medium'}`;
  }

  // Add session-specific context
  if (sessionType === 'checkin' && context) {
    systemPrompt += `\n\nUser Context for this check-in:`;
    if (context.mood_score) {
      systemPrompt += `\n- Current mood: ${context.mood_score}/10`;
    }
    if (context.goals && context.goals.length > 0) {
      systemPrompt += `\n- Goals: ${context.goals.map((g: any) => 
        `${g.goal_text} (${g.completed ? 'completed' : 'not completed'})`
      ).join(', ')}`;
    }
    if (context.reflection) {
      systemPrompt += `\n- User reflection: "${context.reflection}"`;
    }
    if (context.streak && context.streak > 0) {
      systemPrompt += `\n- Current streak: ${context.streak} days`;
    }
  }

  // Add length guidelines based on session type
  if (sessionType === 'chat') {
    systemPrompt += `\n\nKeep responses conversational and under 150 words. Ask follow-up questions to engage the user.`;
  } else if (sessionType === 'checkin') {
    systemPrompt += `\n\nProvide thoughtful, personalized advice in 150-200 words. Focus on their progress and next steps.`;
  } else {
    systemPrompt += `\n\nRespond naturally and helpfully, keeping messages concise but meaningful.`;
  }

  return systemPrompt;
}

function generateFallbackResponse(requestBody: any): string {
  // Parse the request to extract mentor info
  let mentorName = 'Your mentor';
  try {
    const parsed = JSON.parse(requestBody);
    mentorName = parsed.mentor?.name || 'Your mentor';
  } catch (e) {
    // Use default
  }

  const fallbackResponses = [
    `Thanks for sharing that with me. I'm here to support you on your journey. How can I help you move forward today?`,
    `I appreciate you checking in. Your commitment to growth is inspiring. What's one small step you can take right now?`,
    `That's really valuable insight you've shared. Let's focus on what you can control and take action on.`,
    `I hear you, and I want you to know that progress isn't always linear. What matters is that you're here and trying.`,
    `Your self-awareness is growing, and that's a huge win. How can we build on this momentum?`,
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}