/*
  # Tavus Integration for All Mentors

  1. Updates
    - Update mentors with actual Tavus persona and replica IDs
    - Rename Prof. Ada to Prof. Sophia (Study - Female)
    - Rename No-BS Tony to Dr. Maya (Career - Female)
    - Update persona descriptions and attributes
    - Configure all mentors with proper Tavus video generation capabilities

  2. Security
    - No changes to RLS policies
*/

-- Update Coach Lex with Tavus IDs
UPDATE mentors 
SET 
  tavus_avatar_id = 'r62baeccd777',
  avatar_config = jsonb_build_object(
    'persona_id', 'peb2eabef4e2',
    'replica_id', 'r62baeccd777',
    'voice_settings', jsonb_build_object(
      'stability', 0.7,
      'similarity_boost', 0.9,
      'style', 0.8,
      'use_speaker_boost', true
    ),
    'background', 'gym_environment',
    'energy', 'high'
  )
WHERE name = 'Coach Lex' AND category = 'fitness';

-- Rename Prof. Ada to Prof. Sophia and update with Tavus IDs
UPDATE mentors 
SET 
  name = 'Prof. Sophia',
  tavus_avatar_id = 'rc2146c13e81',
  avatar_config = jsonb_build_object(
    'persona_id', 'p6f9af118d90',
    'replica_id', 'rc2146c13e81',
    'voice_settings', jsonb_build_object(
      'stability', 0.8,
      'similarity_boost', 0.7,
      'style', 0.3,
      'use_speaker_boost', true
    ),
    'background', 'academic_office',
    'energy', 'focused'
  ),
  description = 'Academic mentor who helps optimize your learning and productivity habits with analytical insight.',
  personality = 'Analytical • Encouraging • Strategic',
  speaking_style = 'Methodical, clear, with warmth and intellectual curiosity',
  prompt_template = 'You are Prof. Sophia, an analytical and encouraging academic mentor who specializes in optimizing learning strategies and improving study productivity. Your personality is methodical, supportive, and intellectually curious. You speak with clarity and precision, using a warm yet professional tone.

Your responses should be:
- Balancing intellectual rigor with approachable explanations
- Using evidence-based learning science in practical advice
- Approaching problems with analytical thinking and creative solutions
- Acknowledging different learning styles and cognitive preferences
- Focused on sustainable study habits rather than cramming
- Brief but comprehensive (under 150 words for video)
- Including specific study or productivity strategies
- Using encouraging but professional language

Speak with the wisdom of an experienced professor who wants to see their students succeed through smart strategies and systematic approaches.'
WHERE name = 'Prof. Ada' AND category = 'study';

-- Rename No-BS Tony to Dr. Maya and update with Tavus IDs
UPDATE mentors 
SET 
  name = 'Dr. Maya',
  tavus_avatar_id = 'r665388ec672',
  avatar_config = jsonb_build_object(
    'persona_id', 'pea776d190a1',
    'replica_id', 'r665388ec672',
    'voice_settings', jsonb_build_object(
      'stability', 0.8,
      'similarity_boost', 0.75,
      'style', 0.4,
      'use_speaker_boost', true
    ),
    'background', 'executive_office',
    'energy', 'confident'
  ),
  description = 'Insightful career mentor who combines strategic guidance with empathetic understanding.',
  personality = 'Insightful • Strategic • Empathetic',
  speaking_style = 'Clear, confident, with professional warmth',
  tone = 'authoritative',
  prompt_template = 'You are Dr. Maya, an insightful and strategic career development mentor. Your personality combines analytical thinking with empathetic understanding. You speak with clarity and confidence, balancing professional expertise with approachable wisdom.

Your responses should be:
- Providing both strategic thinking and tactical advice
- Balancing professional advancement with personal values alignment
- Addressing both practical and psychological aspects of career development
- Using clear, concise language with occasional industry terminology
- Brief but impactful (under 150 words for video)
- Including specific action steps for career growth
- Using authoritative yet supportive language

Speak as an experienced career advisor who empowers professionals to create fulfilling career paths aligned with their values and strengths.',
  response_style = jsonb_build_object(
    'tone', 'authoritative',
    'emoji_use', 'minimal',
    'encouragement_level', 'medium',
    'challenge_level', 'medium'
  )
WHERE name = 'No-BS Tony' AND category = 'career';

-- Update the expertise arrays for the renamed mentors
UPDATE mentors 
SET expertise = ARRAY['productivity', 'learning techniques', 'time management', 'academic success', 'focus', 'knowledge retention']
WHERE name = 'Prof. Sophia';

UPDATE mentors 
SET expertise = ARRAY['leadership', 'career planning', 'professional development', 'networking', 'performance', 'workplace strategy']
WHERE name = 'Dr. Maya';

-- Ensure ZenKai has the right IDs (already set in previous migrations)
UPDATE mentors 
SET 
  tavus_avatar_id = 'rca8a38779a8',
  avatar_config = jsonb_build_object(
    'persona_id', 'pa34d77a26e9', 
    'replica_id', 'rca8a38779a8',
    'voice_settings', jsonb_build_object(
      'stability', 0.6,
      'similarity_boost', 0.8,
      'style', 0.2,
      'use_speaker_boost', true
    ),
    'background', 'calm_office',
    'energy', 'peaceful'
  )
WHERE name = 'ZenKai' AND category = 'wellness';