/*
  # Create check-ins system

  1. New Tables
    - `checkins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `mentor_id` (uuid, foreign key to mentors)
      - `mode` (text, classic or realtime)
      - `mood_score` (integer, 1-10)
      - `reflection` (text)
      - `goal_status` (jsonb, array of goal completion statuses)
      - `emotion_score` (integer, 1-10)
      - `video_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `checkins` table
    - Add policies for authenticated users to manage their own check-ins
*/

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES mentors(id),
  mode text NOT NULL DEFAULT 'classic' CHECK (mode IN ('classic', 'realtime')),
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  reflection text,
  goal_status jsonb DEFAULT '[]'::jsonb,
  emotion_score integer CHECK (emotion_score >= 1 AND emotion_score <= 10),
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert own checkins"
  ON checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own checkins"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own checkins"
  ON checkins
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own checkins"
  ON checkins
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS checkins_user_id_created_at_idx 
  ON checkins(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS checkins_user_id_mentor_id_idx 
  ON checkins(user_id, mentor_id);