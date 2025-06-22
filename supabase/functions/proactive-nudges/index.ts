import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface NudgePattern {
  type: 'missed_checkins' | 'low_mood' | 'goal_struggle' | 'streak_break' | 'celebration';
  severity: 'low' | 'medium' | 'high';
  data: any;
}

interface ProactiveMessage {
  user_id: string;
  mentor_id: string;
  message_type: 'nudge' | 'celebration' | 'suggestion';
  content: string;
  metadata: any;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, default_mentor_id, email, full_name')
      .eq('onboarding_completed', true);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const nudgesSent = [];

    for (const user of users) {
      const patterns = await analyzeUserPatterns(supabase, user.id);
      
      for (const pattern of patterns) {
        const message = await generateProactiveMessage(pattern, user);
        if (message) {
          await sendProactiveMessage(supabase, message);
          nudgesSent.push({ user_id: user.id, pattern: pattern.type });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      nudges_sent: nudgesSent.length,
      details: nudgesSent
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Proactive nudges error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function analyzeUserPatterns(supabase: any, userId: string): Promise<NudgePattern[]> {
  const patterns: NudgePattern[] = [];
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Check for missed check-ins
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('created_at, mood_score')
    .eq('user_id', userId)
    .gte('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (!recentCheckins || recentCheckins.length === 0) {
    patterns.push({
      type: 'missed_checkins',
      severity: 'high',
      data: { days_missed: 3 }
    });
  }

  // Check for consistent low mood
  const { data: weeklyCheckins } = await supabase
    .from('checkins')
    .select('mood_score, created_at')
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgo.toISOString());

  if (weeklyCheckins && weeklyCheckins.length >= 3) {
    const avgMood = weeklyCheckins.reduce((sum, c) => sum + c.mood_score, 0) / weeklyCheckins.length;
    const lowMoodCount = weeklyCheckins.filter(c => c.mood_score <= 4).length;
    
    if (avgMood <= 5 && lowMoodCount >= 2) {
      patterns.push({
        type: 'low_mood',
        severity: 'high',
        data: { avg_mood: avgMood, low_mood_count: lowMoodCount }
      });
    }
  }

  // Check for goal struggles
  const { data: goalPerformance } = await supabase
    .from('checkins')
    .select('goal_status')
    .eq('user_id', userId)
    .gte('created_at', twoWeeksAgo.toISOString());

  if (goalPerformance && goalPerformance.length >= 5) {
    let totalGoals = 0;
    let completedGoals = 0;
    
    goalPerformance.forEach(checkin => {
      const goals = checkin.goal_status || [];
      totalGoals += goals.length;
      completedGoals += goals.filter((g: any) => g.completed).length;
    });
    
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    if (completionRate < 40) {
      patterns.push({
        type: 'goal_struggle',
        severity: 'medium',
        data: { completion_rate: completionRate, total_goals: totalGoals }
      });
    }
  }

  // Check for positive patterns (celebrations)
  if (weeklyCheckins && weeklyCheckins.length >= 5) {
    const recentMoods = weeklyCheckins.slice(0, 3).map(c => c.mood_score);
    const avgRecentMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
    
    if (avgRecentMood >= 8) {
      patterns.push({
        type: 'celebration',
        severity: 'low',
        data: { avg_mood: avgRecentMood, streak_length: weeklyCheckins.length }
      });
    }
  }

  return patterns;
}

async function generateProactiveMessage(pattern: NudgePattern, user: any): Promise<ProactiveMessage | null> {
  try {
    // Get user's default mentor
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: mentor } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', user.default_mentor_id)
      .single();

    if (!mentor) return null;

    // Generate AI response using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return generateFallbackMessage(pattern, mentor, user);
    }

    const prompt = buildProactivePrompt(pattern, mentor, user);
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Generate a proactive ${pattern.type} message for ${user.full_name || 'the user'}.`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      return generateFallbackMessage(pattern, mentor, user);
    }

    const aiResponse = await openaiResponse.json();
    const content = aiResponse.choices[0]?.message?.content?.trim();

    if (!content) {
      return generateFallbackMessage(pattern, mentor, user);
    }

    return {
      user_id: user.id,
      mentor_id: mentor.id,
      message_type: pattern.type === 'celebration' ? 'celebration' : 'nudge',
      content,
      metadata: {
        pattern_type: pattern.type,
        pattern_data: pattern.data,
        ai_generated: true,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error generating proactive message:', error);
    return null;
  }
}

function buildProactivePrompt(pattern: NudgePattern, mentor: any, user: any): string {
  const basePrompt = `You are ${mentor.name}, a ${mentor.category} mentor. Your personality: ${mentor.personality}. Your speaking style: ${mentor.speaking_style}.

User: ${user.full_name || 'User'}
Pattern detected: ${pattern.type}
Pattern data: ${JSON.stringify(pattern.data)}

Generate a proactive, caring message that:
1. Addresses the specific pattern in a supportive way
2. Maintains your mentor personality
3. Offers specific, actionable advice
4. Is encouraging but not pushy
5. Is under 150 words
6. Feels personal and timely

`;

  switch (pattern.type) {
    case 'missed_checkins':
      return basePrompt + `The user hasn't checked in for ${pattern.data.days_missed} days. Gently encourage them to reconnect without making them feel guilty.`;
    
    case 'low_mood':
      return basePrompt + `The user has been experiencing lower mood scores (avg: ${pattern.data.avg_mood}/10). Offer empathetic support and practical suggestions.`;
    
    case 'goal_struggle':
      return basePrompt + `The user's goal completion rate is ${pattern.data.completion_rate}%. Provide encouraging guidance on goal adjustment or strategy.`;
    
    case 'celebration':
      return basePrompt + `The user has been doing great (avg mood: ${pattern.data.avg_mood}/10)! Celebrate their success and encourage continued momentum.`;
    
    default:
      return basePrompt + 'Send a general supportive message.';
  }
}

function generateFallbackMessage(pattern: NudgePattern, mentor: any, user: any): ProactiveMessage {
  const mentorMessages = {
    'ZenKai': {
      missed_checkins: "Hello, I've noticed you haven't checked in lately. Remember, there's no judgment here - just gentle encouragement to reconnect with your journey. When you're ready, I'll be here to support you with mindful guidance.",
      low_mood: "I sense you've been having some challenging days recently. Please remember that difficult emotions are part of the human experience. Take a deep breath, be kind to yourself, and know that this too shall pass.",
      goal_struggle: "It seems your goals might need some adjustment. This isn't failure - it's wisdom. Sometimes we need to adapt our path to honor where we are right now. Let's explore what truly serves you.",
      celebration: "I'm sensing beautiful energy from your recent check-ins! Your consistency and positive mood are inspiring. Keep nurturing this momentum with gentle awareness and self-compassion."
    },
    'Coach Lex': {
      missed_checkins: "Hey champion! 💪 I noticed you've been MIA from our check-ins. No worries - even the strongest athletes need rest days! But let's get back in there and show your goals who's boss! Ready to crush it?",
      low_mood: "I can see you've been having some tough days, but remember - that's when champions are made! Every setback is a setup for a comeback. Let's channel that energy into movement and momentum! 🔥",
      goal_struggle: "Listen, goal struggles are just part of the game! Even elite athletes adjust their training. Let's reassess, refocus, and come back stronger. You've got this - I believe in you 100%!",
      celebration: "YESSS! 🙌 Look at you absolutely CRUSHING it! Your positive energy and consistency are off the charts! Keep this momentum going - you're in beast mode and I'm here for it!"
    },
    'Prof. Ada': {
      missed_checkins: "I've observed a gap in your check-in pattern. Consistency is key to building sustainable habits. Consider scheduling a specific time for daily reflection - this creates a systematic approach to accountability.",
      low_mood: "Your recent mood data suggests you're experiencing a challenging period. Research shows that structured activities and goal-setting can help. Let's analyze what factors might be contributing and develop a strategic response.",
      goal_struggle: "Your goal completion metrics indicate room for optimization. This is valuable data! Let's reassess your objectives using SMART criteria and adjust your approach based on what the evidence shows.",
      celebration: "Excellent work! Your consistent positive metrics demonstrate the power of systematic habit building. This upward trend validates your approach - let's analyze what's working and replicate it."
    },
    'No-BS Tony': {
      missed_checkins: "Alright, enough excuses. You've been radio silent for days. I get it - life happens. But successful people show up even when they don't feel like it. Time to get back in there and do the work.",
      low_mood: "Look, low moods happen to everyone. But you can't let them control your trajectory. Stop wallowing and start acting. Take one small step forward today. Action creates momentum, not feelings.",
      goal_struggle: "Your goal completion rate is telling me you're either overcommitting or underperforming. Time for some real talk: What are you actually going to DO differently? No more excuses, just results.",
      celebration: "Now THIS is what I'm talking about! You're proving that consistency pays off. Don't get comfortable though - this is your new baseline. Keep pushing and raise that bar even higher."
    }
  };

  const messages = mentorMessages[mentor.name as keyof typeof mentorMessages] || mentorMessages['ZenKai'];
  const content = messages[pattern.type as keyof typeof messages] || "Keep up the great work! I'm here to support you on your journey.";

  return {
    user_id: user.id,
    mentor_id: mentor.id,
    message_type: pattern.type === 'celebration' ? 'celebration' : 'nudge',
    content,
    metadata: {
      pattern_type: pattern.type,
      pattern_data: pattern.data,
      ai_generated: false,
      fallback: true,
      timestamp: new Date().toISOString()
    }
  };
}

async function sendProactiveMessage(supabase: any, message: ProactiveMessage): Promise<void> {
  // Create a new chat session if one doesn't exist for today
  const today = new Date().toISOString().split('T')[0];
  
  let { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('user_id', message.user_id)
    .eq('mentor_id', message.mentor_id)
    .eq('status', 'active')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .single();

  if (!session) {
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: message.user_id,
        mentor_id: message.mentor_id,
        session_type: 'text',
        status: 'active'
      })
      .select('id')
      .single();
    
    session = newSession;
  }

  if (session) {
    // Insert the proactive message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        sender_type: 'mentor',
        message_type: 'text',
        content: message.content,
        metadata: {
          ...message.metadata,
          proactive: true,
          message_category: message.message_type
        }
      });
  }
}