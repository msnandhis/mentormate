/*
  # Video Integration Schema

  1. New Tables
    - `custom_avatars` - Custom user-created avatars
    - `voice_samples` - Voice recordings for cloning
    - `video_generations` - Track video generation requests
    - `avatar_configs` - Avatar configuration settings

  2. Updates
    - Add video-related fields to existing tables
    - Update mentor_responses with video capabilities

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data protection
*/

-- Create custom_avatars table
CREATE TABLE IF NOT EXISTS custom_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  tavus_avatar_id text UNIQUE,
  status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'training', 'ready', 'failed')),
  avatar_type text NOT NULL DEFAULT 'standard' CHECK (avatar_type IN ('standard', 'voice_clone', 'custom')),
  configuration jsonb DEFAULT '{}',
  training_data jsonb DEFAULT '{}',
  sample_video_url text,
  preview_video_url text,
  voice_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create voice_samples table
CREATE TABLE IF NOT EXISTS voice_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  custom_avatar_id uuid REFERENCES custom_avatars(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  duration_seconds integer,
  transcription text,
  quality_score integer CHECK (quality_score >= 1 AND quality_score <= 10),
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

-- Create video_generations table
CREATE TABLE IF NOT EXISTS video_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  checkin_id uuid REFERENCES checkins(id) ON DELETE CASCADE,
  mentor_response_id uuid REFERENCES mentor_responses(id) ON DELETE CASCADE,
  avatar_id text NOT NULL,
  script_text text NOT NULL,
  tavus_request_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'generating', 'completed', 'failed')),
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  generation_time_ms integer,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create avatar_configs table for detailed avatar settings
CREATE TABLE IF NOT EXISTS avatar_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_avatar_id uuid NOT NULL REFERENCES custom_avatars(id) ON DELETE CASCADE,
  config_type text NOT NULL CHECK (config_type IN ('appearance', 'voice', 'behavior', 'background')),
  settings jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE custom_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_configs ENABLE ROW LEVEL SECURITY;

-- Custom avatars policies
CREATE POLICY "Users can read own custom avatars"
  ON custom_avatars
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own custom avatars"
  ON custom_avatars
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own custom avatars"
  ON custom_avatars
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own custom avatars"
  ON custom_avatars
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Voice samples policies
CREATE POLICY "Users can read own voice samples"
  ON voice_samples
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own voice samples"
  ON voice_samples
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own voice samples"
  ON voice_samples
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own voice samples"
  ON voice_samples
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Video generations policies
CREATE POLICY "Users can read own video generations"
  ON video_generations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own video generations"
  ON video_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Avatar configs policies
CREATE POLICY "Users can read own avatar configs"
  ON avatar_configs
  FOR SELECT
  TO authenticated
  USING (
    custom_avatar_id IN (
      SELECT id FROM custom_avatars WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own avatar configs"
  ON avatar_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    custom_avatar_id IN (
      SELECT id FROM custom_avatars WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own avatar configs"
  ON avatar_configs
  FOR UPDATE
  TO authenticated
  USING (
    custom_avatar_id IN (
      SELECT id FROM custom_avatars WHERE user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_custom_avatars_updated_at
  BEFORE UPDATE ON custom_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_generations_updated_at
  BEFORE UPDATE ON video_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatar_configs_updated_at
  BEFORE UPDATE ON avatar_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS custom_avatars_user_status_idx 
  ON custom_avatars(user_id, status);

CREATE INDEX IF NOT EXISTS voice_samples_user_avatar_idx 
  ON voice_samples(user_id, custom_avatar_id);

CREATE INDEX IF NOT EXISTS video_generations_user_status_idx 
  ON video_generations(user_id, status);

CREATE INDEX IF NOT EXISTS video_generations_checkin_idx 
  ON video_generations(checkin_id);

CREATE INDEX IF NOT EXISTS avatar_configs_avatar_type_idx 
  ON avatar_configs(custom_avatar_id, config_type);

-- Update user_profiles to link to custom avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'active_custom_avatar_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN active_custom_avatar_id uuid REFERENCES custom_avatars(id);
  END IF;
END $$;

-- Add video capabilities to mentor_responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_responses' AND column_name = 'video_generation_id'
  ) THEN
    ALTER TABLE mentor_responses ADD COLUMN video_generation_id uuid REFERENCES video_generations(id);
  END IF;
END $$;