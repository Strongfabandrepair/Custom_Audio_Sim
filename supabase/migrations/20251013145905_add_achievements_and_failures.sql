/*
  # Achievements and Failure System

  ## Overview
  This migration adds achievement tracking and failure history for the car audio game.
  Includes the legendary "Glass Breaker" achievement for shattering windows with maximum SPL.

  ## New Tables
  
  ### 1. achievements
  - `id` (uuid, primary key)
  - `key` (text, unique) - Achievement identifier
  - `name` (text) - Display name
  - `description` (text)
  - `icon` (text) - Icon identifier
  - `rarity` (text) - common, rare, epic, legendary
  - `requirement_type` (text) - spl_threshold, glass_break, competitions_won, etc.
  - `requirement_value` (numeric)
  
  ### 2. user_achievements
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `achievement_id` (uuid, foreign key)
  - `unlocked_at` (timestamptz)
  - `competition_result_id` (uuid, foreign key, nullable) - Reference to the competition where achieved
  
  ### 3. build_failures
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `user_vehicle_id` (uuid, foreign key)
  - `failure_type` (text) - electrical_overload, structural_failure, voltage_drop
  - `description` (text)
  - `spl_at_failure` (numeric)
  - `occurred_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can view achievements and their own unlocked achievements
  - Users can only view their own failures
*/

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  requirement_type text NOT NULL,
  requirement_value numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  competition_result_id uuid REFERENCES competition_results(id) ON DELETE SET NULL,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS build_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  user_vehicle_id uuid REFERENCES user_vehicles(id) ON DELETE CASCADE NOT NULL,
  failure_type text NOT NULL,
  description text NOT NULL,
  spl_at_failure numeric NOT NULL DEFAULT 0,
  occurred_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own unlocked achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can unlock achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own failures"
  ON build_failures FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own failures"
  ON build_failures FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

INSERT INTO achievements (key, name, description, icon, rarity, requirement_type, requirement_value) VALUES
('first_competition', 'First Blood', 'Complete your first competition', 'trophy', 'common', 'competitions_entered', 1),
('first_win', 'Winner Winner', 'Win your first competition', 'medal', 'common', 'competitions_won', 1),
('spl_master_90', 'Sound Warrior', 'Achieve 90 dB SPL', 'volume', 'common', 'spl_threshold', 90),
('spl_master_100', 'Decibel Demon', 'Achieve 100 dB SPL', 'volume', 'rare', 'spl_threshold', 100),
('spl_master_110', 'Bass God', 'Achieve 110 dB SPL', 'volume', 'epic', 'spl_threshold', 110),
('glass_breaker', 'Glass Breaker', 'Shatter your vehicle windows with pure bass power! The ultimate achievement.', 'sparkles', 'legendary', 'glass_break', 115),
('electrical_overload', 'Spark Show', 'Experience a catastrophic electrical failure', 'zap', 'common', 'failure', 1),
('survivor', 'Built Different', 'Win a competition after experiencing a failure', 'shield', 'rare', 'win_after_failure', 1),
('millionaire', 'Money Maker', 'Earn $10,000 total', 'dollar', 'rare', 'total_earnings', 10000),
('champion', 'Champion', 'Win 10 competitions', 'crown', 'epic', 'competitions_won', 10);
