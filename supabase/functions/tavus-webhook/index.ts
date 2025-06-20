import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-tavus-signature",
}

interface TavusWebhookPayload {
  event_type: 'avatar.ready' | 'avatar.error' | 'video.completed' | 'video.error' | 'voice.ready' | 'voice.error';
  data: {
    id: string;
    status: string;
    error_message?: string;
    video_url?: string;
    thumbnail_url?: string;
    download_url?: string;
    training_progress?: number;
  };
  timestamp: string;
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
    const signature = req.headers.get("x-tavus-signature");
    const body = await req.text();
    
    // Verify webhook signature if needed
    // const isValid = verifySignature(body, signature, WEBHOOK_SECRET);
    // if (!isValid) {
    //   return new Response(JSON.stringify({ error: "Invalid signature" }), {
    //     status: 401,
    //     headers: { ...corsHeaders, "Content-Type": "application/json" },
    //   });
    // }

    const payload: TavusWebhookPayload = JSON.parse(body);
    
    // Handle different webhook events
    switch (payload.event_type) {
      case 'avatar.ready':
        await handleAvatarReady(payload);
        break;
      case 'avatar.error':
        await handleAvatarError(payload);
        break;
      case 'video.completed':
        await handleVideoCompleted(payload);
        break;
      case 'video.error':
        await handleVideoError(payload);
        break;
      case 'voice.ready':
        await handleVoiceReady(payload);
        break;
      case 'voice.error':
        await handleVoiceError(payload);
        break;
      default:
        console.log(`Unknown event type: ${payload.event_type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleAvatarReady(payload: TavusWebhookPayload) {
  const { data } = payload;
  
  // Update custom_avatars table
  const { error } = await supabase
    .from('custom_avatars')
    .update({
      status: 'ready',
      tavus_avatar_id: data.id,
      updated_at: new Date().toISOString(),
    })
    .eq('tavus_avatar_id', data.id);

  if (error) {
    console.error('Error updating avatar status:', error);
  }
}

async function handleAvatarError(payload: TavusWebhookPayload) {
  const { data } = payload;
  
  // Update custom_avatars table
  const { error } = await supabase
    .from('custom_avatars')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('tavus_avatar_id', data.id);

  if (error) {
    console.error('Error updating avatar status:', error);
  }
}

async function handleVideoCompleted(payload: TavusWebhookPayload) {
  const { data } = payload;
  
  // Update video_generations table
  const { error } = await supabase
    .from('video_generations')
    .update({
      status: 'completed',
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      updated_at: new Date().toISOString(),
    })
    .eq('tavus_request_id', data.id);

  if (error) {
    console.error('Error updating video status:', error);
  }

  // Also update mentor_responses if this is a mentor response video
  const { error: responseError } = await supabase
    .from('mentor_responses')
    .update({
      video_url: data.video_url,
      tavus_video_id: data.id,
    })
    .eq('tavus_video_id', data.id);

  if (responseError) {
    console.error('Error updating mentor response:', responseError);
  }
}

async function handleVideoError(payload: TavusWebhookPayload) {
  const { data } = payload;
  
  // Update video_generations table
  const { error } = await supabase
    .from('video_generations')
    .update({
      status: 'failed',
      error_message: data.error_message,
      updated_at: new Date().toISOString(),
    })
    .eq('tavus_request_id', data.id);

  if (error) {
    console.error('Error updating video status:', error);
  }
}

async function handleVoiceReady(payload: TavusWebhookPayload) {
  const { data } = payload;
  
  // Update user_profiles table if this voice is linked to a profile
  const { error } = await supabase
    .from('user_profiles')
    .update({
      custom_voice_id: data.id,
      updated_at: new Date().toISOString(),
    })
    .eq('custom_voice_id', data.id);

  if (error) {
    console.error('Error updating voice status:', error);
  }
}

async function handleVoiceError(payload: TavusWebhookPayload) {
  const { data } = payload;
  
  // Handle voice training errors
  console.error(`Voice training failed for ${data.id}:`, data.error_message);
  
  // Could send notification to user or update status
}