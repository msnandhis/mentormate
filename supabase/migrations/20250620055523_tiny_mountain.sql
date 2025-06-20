/*
  # Create initial schema for MentorMate

  1. New Tables
    - `mentors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `tone` (text)
      - `tavus_avatar_id` (text)
      - `description` (text)
      - `is_custom` (boolean)
      - `personality` (text)
      - `gradient` (text)
      - `created_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `default_mentor_id` (uuid, references mentors)
      - `custom_voice_id` (uuid, optional)
      - `preferred_mode` (text, default 'classic')
      - `onboarding_completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `text` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  tone text NOT NULL,
  tavus_avatar_id text,
  description text NOT NULL,
  is_custom boolean DEFAULT false,
  personality text,
  gradient text,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  default_mentor_id uuid REFERENCES mentors(id),
  custom_voice_id uuid,
  preferred_mode text DEFAULT 'classic' CHECK (preferred_mode IN ('classic', 'realtime')),
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Mentors policies (public read, no write for regular users)
CREATE POLICY "Anyone can read mentors"
  ON mentors
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default mentors
INSERT INTO mentors (name, category, tone, description, personality, gradient) VALUES
  ('Coach Lex', 'fitness', 'energetic', 'Motivational fitness coach who keeps you moving and celebrates every win.', 'Energetic • Supportive • Results-focused', 'from-red-500 to-orange-500'),
  ('ZenKai', 'wellness', 'calm', 'Mindful wellness guide focused on balance, stress relief, and inner peace.', 'Calm • Empathetic • Wise', 'from-blue-500 to-teal-500'),
  ('Prof. Ada', 'study', 'analytical', 'Academic mentor who helps optimize your learning and productivity habits.', 'Analytical • Encouraging • Strategic', 'from-purple-500 to-pink-500'),
  ('No-BS Tony', 'career', 'direct', 'Direct career coach who cuts through excuses and drives real progress.', 'Direct • Ambitious • Practical', 'from-gray-600 to-gray-800');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();