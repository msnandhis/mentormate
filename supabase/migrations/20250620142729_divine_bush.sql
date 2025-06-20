/*
  # Tavus Live Conversations

  1. New Tables
    - `tavus_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `mentor_id` (uuid, foreign key to mentors)
      - `tavus_conversation_id` (text, unique - from Tavus API)
      - `conversation_url` (text - embeddable URL from Tavus)
      - `status` (text - active, ended, error)
      - `conversation_name` (text)
      - `conversational_context` (text)
      - `custom_greeting` (text)
      - `properties` (jsonb - Tavus conversation properties)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `duration_seconds` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `conversation_events`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to tavus_conversations)
      - `event_type` (text - joined, left, message, etc.)
      - `event_data` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
*/

-- Create tavus_conversations table
CREATE TABLE IF NOT EXISTS tavus_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES mentors(id),
  tavus_conversation_id text UNIQUE,
  conversation_url text,
  status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'active', 'ended', 'error')),
  conversation_name text,
  conversational_context text,
  custom_greeting text,
  properties jsonb DEFAULT '{}',
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_events table
CREATE TABLE IF NOT EXISTS conversation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES tavus_conversations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('created', 'joined', 'left', 'message', 'ended', 'error')),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tavus_conversations_user_id_idx ON tavus_conversations(user_id);
CREATE INDEX IF NOT EXISTS tavus_conversations_mentor_id_idx ON tavus_conversations(mentor_id);
CREATE INDEX IF NOT EXISTS tavus_conversations_status_idx ON tavus_conversations(status);
CREATE INDEX IF NOT EXISTS tavus_conversations_created_at_idx ON tavus_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS conversation_events_conversation_id_idx ON conversation_events(conversation_id);
CREATE INDEX IF NOT EXISTS conversation_events_event_type_idx ON conversation_events(event_type);

-- Enable RLS
ALTER TABLE tavus_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tavus_conversations
CREATE POLICY "Users can insert own conversations"
  ON tavus_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own conversations"
  ON tavus_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON tavus_conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for conversation_events
CREATE POLICY "Users can insert events for own conversations"
  ON conversation_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM tavus_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read events for own conversations"
  ON conversation_events
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM tavus_conversations WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger for tavus_conversations
CREATE TRIGGER update_tavus_conversations_updated_at
  BEFORE UPDATE ON tavus_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();