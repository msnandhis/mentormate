/*
  # Enhanced Multi-mentor Support System

  1. New Tables
    - Enhanced `mentors` table with detailed personality data
    - `mentor_prompts` for category-specific prompting logic
    - `mentor_responses` for storing AI-generated responses

  2. Updates
    - Add more detailed mentor personality fields
    - Add prompting templates and logic
    - Add mentor expertise and specializations

  3. Security
    - Maintain existing RLS policies
    - Add policies for new tables
*/

-- Add new columns to mentors table for enhanced personality system
DO $$
BEGIN
  -- Add expertise field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'expertise'
  ) THEN
    ALTER TABLE mentors ADD COLUMN expertise text[];
  END IF;

  -- Add speaking_style field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'speaking_style'
  ) THEN
    ALTER TABLE mentors ADD COLUMN speaking_style text;
  END IF;

  -- Add motivation_approach field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'motivation_approach'
  ) THEN
    ALTER TABLE mentors ADD COLUMN motivation_approach text;
  END IF;

  -- Add prompt_template field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'prompt_template'
  ) THEN
    ALTER TABLE mentors ADD COLUMN prompt_template text;
  END IF;

  -- Add response_style field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'response_style'
  ) THEN
    ALTER TABLE mentors ADD COLUMN response_style jsonb DEFAULT '{}';
  END IF;

  -- Add avatar_config field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentors' AND column_name = 'avatar_config'
  ) THEN
    ALTER TABLE mentors ADD COLUMN avatar_config jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create mentor_responses table for storing AI-generated responses
CREATE TABLE IF NOT EXISTS mentor_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id uuid REFERENCES checkins(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES mentors(id),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  prompt_data jsonb NOT NULL DEFAULT '{}',
  response_text text NOT NULL,
  response_metadata jsonb DEFAULT '{}',
  tavus_video_id text,
  video_url text,
  generation_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on mentor_responses
ALTER TABLE mentor_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for mentor_responses
CREATE POLICY "Users can read own mentor responses"
  ON mentor_responses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own mentor responses"
  ON mentor_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS mentor_responses_user_checkin_idx 
  ON mentor_responses(user_id, checkin_id);

CREATE INDEX IF NOT EXISTS mentor_responses_mentor_created_idx 
  ON mentor_responses(mentor_id, created_at DESC);

-- Update existing mentors with enhanced data
UPDATE mentors SET
  expertise = CASE category
    WHEN 'fitness' THEN ARRAY['exercise', 'nutrition', 'strength training', 'cardio', 'recovery']
    WHEN 'wellness' THEN ARRAY['mindfulness', 'stress management', 'meditation', 'work-life balance', 'mental health']
    WHEN 'study' THEN ARRAY['productivity', 'learning techniques', 'time management', 'academic success', 'focus']
    WHEN 'career' THEN ARRAY['goal setting', 'leadership', 'professional development', 'networking', 'performance']
    ELSE ARRAY['general coaching']
  END,
  speaking_style = CASE name
    WHEN 'Coach Lex' THEN 'High-energy, motivational, uses fitness terminology and encouragement'
    WHEN 'ZenKai' THEN 'Calm, mindful, speaks with gentle wisdom and metaphors'
    WHEN 'Prof. Ada' THEN 'Analytical, structured, educational and strategic in approach'
    WHEN 'No-BS Tony' THEN 'Direct, no-nonsense, results-focused with tough love'
    ELSE 'Supportive and encouraging'
  END,
  motivation_approach = CASE name
    WHEN 'Coach Lex' THEN 'Celebrates wins, pushes through challenges, focuses on progress over perfection'
    WHEN 'ZenKai' THEN 'Emphasizes self-compassion, mindful awareness, and gentle progression'
    WHEN 'Prof. Ada' THEN 'Uses data and insights, breaks down complex goals, systematic approach'
    WHEN 'No-BS Tony' THEN 'Challenges excuses, demands accountability, focuses on action over feelings'
    ELSE 'Balanced support and challenge'
  END,
  prompt_template = CASE name
    WHEN 'Coach Lex' THEN 'You are Coach Lex, a high-energy fitness mentor. Respond with enthusiasm, use motivational language, and relate everything back to building strength and momentum. Keep responses under 150 words and end with an encouraging challenge or next step.'
    WHEN 'ZenKai' THEN 'You are ZenKai, a mindful wellness guide. Speak with calm wisdom, use gentle language, and focus on balance and self-awareness. Include mindful observations and encourage self-compassion. Keep responses under 150 words.'
    WHEN 'Prof. Ada' THEN 'You are Prof. Ada, an analytical learning mentor. Provide structured, insightful responses that break down challenges into manageable steps. Use educational language and focus on systems and strategies. Keep responses under 150 words.'
    WHEN 'No-BS Tony' THEN 'You are No-BS Tony, a direct career coach. Give straight-talking advice, challenge excuses, and focus on immediate actions. Be supportive but firm. Keep responses under 150 words and end with a clear action item.'
    ELSE 'You are a supportive AI mentor. Provide encouraging, personalized advice based on the user''s check-in. Keep responses under 150 words.'
  END,
  response_style = CASE name
    WHEN 'Coach Lex' THEN '{"tone": "energetic", "emoji_use": "high", "encouragement_level": "high", "challenge_level": "medium"}'::jsonb
    WHEN 'ZenKai' THEN '{"tone": "calm", "emoji_use": "minimal", "encouragement_level": "gentle", "challenge_level": "low"}'::jsonb
    WHEN 'Prof. Ada' THEN '{"tone": "analytical", "emoji_use": "low", "encouragement_level": "medium", "challenge_level": "high"}'::jsonb
    WHEN 'No-BS Tony' THEN '{"tone": "direct", "emoji_use": "minimal", "encouragement_level": "tough", "challenge_level": "high"}'::jsonb
    ELSE '{"tone": "supportive", "emoji_use": "medium", "encouragement_level": "medium", "challenge_level": "medium"}'::jsonb
  END,
  avatar_config = CASE name
    WHEN 'Coach Lex' THEN '{"appearance": "athletic", "clothing": "workout gear", "background": "gym", "energy": "high"}'::jsonb
    WHEN 'ZenKai' THEN '{"appearance": "serene", "clothing": "casual zen", "background": "nature", "energy": "calm"}'::jsonb
    WHEN 'Prof. Ada' THEN '{"appearance": "professional", "clothing": "smart casual", "background": "study", "energy": "focused"}'::jsonb
    WHEN 'No-BS Tony' THEN '{"appearance": "confident", "clothing": "business casual", "background": "office", "energy": "intense"}'::jsonb
    ELSE '{"appearance": "friendly", "clothing": "casual", "background": "neutral", "energy": "balanced"}'::jsonb
  END;

-- Add a new custom mentor placeholder for voice cloning
INSERT INTO mentors (name, category, tone, description, is_custom, personality, gradient, expertise, speaking_style, motivation_approach, prompt_template, response_style, avatar_config)
VALUES (
  'Your Voice',
  'custom',
  'personal',
  'Create a personalized mentor using your own voice and preferences for the ultimate customized experience.',
  true,
  'Unique • Personal • Authentic',
  'from-primary-500 to-primary-700',
  ARRAY['personalized coaching', 'custom guidance'],
  'Mirrors your own communication style and preferences',
  'Adapts to your personal motivation style and goals',
  'You are a personalized AI mentor created from the user''s voice. Respond in a style that feels authentic and personally motivating to this specific user. Keep responses under 150 words.',
  '{"tone": "personal", "emoji_use": "user_preference", "encouragement_level": "adaptive", "challenge_level": "user_preference"}'::jsonb,
  '{"appearance": "user_defined", "clothing": "user_preference", "background": "user_choice", "energy": "adaptive"}'::jsonb
);