/*
  # Car Audio Simulation Game Database Schema

  ## Overview
  This migration creates the complete database schema for a car audio simulation game
  with vehicle customization, equipment installation, electrical system management,
  and SPL competition features.

  ## New Tables
  
  ### 1. vehicles
  - `id` (uuid, primary key)
  - `name` (text) - Vehicle model name
  - `type` (text) - sedan, suv, truck, hatchback
  - `trunk_width` (integer) - cm
  - `trunk_height` (integer) - cm
  - `trunk_depth` (integer) - cm
  - `cabin_space` (integer) - additional installation space
  - `stock_alternator_amps` (integer) - stock electrical output
  - `stock_battery_capacity` (integer) - amp hours
  - `base_price` (integer) - cost to unlock vehicle
  - `image_url` (text) - vehicle image reference
  
  ### 2. equipment_categories
  - `id` (uuid, primary key)
  - `name` (text) - subwoofer, amplifier, speaker, head_unit, battery, alternator, capacitor, led_lighting, sound_deadening
  - `description` (text)
  
  ### 3. equipment
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key)
  - `name` (text)
  - `brand` (text)
  - `price` (integer)
  - `power_draw_watts` (integer) - electrical consumption
  - `rms_watts` (integer) - for amps/subs
  - `spl_rating` (numeric) - base SPL contribution
  - `size_width` (integer) - cm
  - `size_height` (integer) - cm
  - `size_depth` (integer) - cm
  - `weight_kg` (numeric)
  - `specs` (jsonb) - additional specs (impedance, frequency response, etc)
  
  ### 4. user_profiles
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique)
  - `cash` (integer) - current money
  - `total_earnings` (integer) - lifetime earnings
  - `competition_wins` (integer)
  - `created_at` (timestamptz)
  
  ### 5. user_vehicles
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `vehicle_id` (uuid, foreign key)
  - `is_active` (boolean) - currently selected vehicle
  - `alternator_amps` (integer) - upgraded value
  - `battery_capacity` (integer) - upgraded value
  - `purchased_at` (timestamptz)
  
  ### 6. installed_equipment
  - `id` (uuid, primary key)
  - `user_vehicle_id` (uuid, foreign key)
  - `equipment_id` (uuid, foreign key)
  - `position_x` (integer) - installation coordinates
  - `position_y` (integer)
  - `position_z` (integer)
  - `rotation` (integer) - degrees
  - `installed_at` (timestamptz)
  
  ### 7. competition_categories
  - `id` (uuid, primary key)
  - `name` (text) - Street, Pro, Extreme, Unlimited
  - `min_spl` (numeric) - minimum SPL to enter
  - `max_power_watts` (integer) - power limit
  - `entry_fee` (integer)
  - `prize_money` (integer)
  - `difficulty` (integer) - 1-5
  
  ### 8. competition_results
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `user_vehicle_id` (uuid, foreign key)
  - `category_id` (uuid, foreign key)
  - `user_spl` (numeric) - user's SPL score
  - `user_rank` (integer) - placement
  - `prize_won` (integer)
  - `ai_scores` (jsonb) - AI opponent scores
  - `competed_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own profiles, vehicles, and equipment
  - Competition categories and equipment catalog are publicly readable
  - Only authenticated users can compete and install equipment
*/

-- Create tables
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  trunk_width integer NOT NULL,
  trunk_height integer NOT NULL,
  trunk_depth integer NOT NULL,
  cabin_space integer NOT NULL DEFAULT 0,
  stock_alternator_amps integer NOT NULL,
  stock_battery_capacity integer NOT NULL,
  base_price integer NOT NULL DEFAULT 0,
  image_url text
);

CREATE TABLE IF NOT EXISTS equipment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES equipment_categories(id) NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  price integer NOT NULL,
  power_draw_watts integer NOT NULL DEFAULT 0,
  rms_watts integer DEFAULT 0,
  spl_rating numeric DEFAULT 0,
  size_width integer NOT NULL,
  size_height integer NOT NULL,
  size_depth integer NOT NULL,
  weight_kg numeric DEFAULT 0,
  specs jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  cash integer NOT NULL DEFAULT 5000,
  total_earnings integer NOT NULL DEFAULT 0,
  competition_wins integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  is_active boolean DEFAULT false,
  alternator_amps integer NOT NULL,
  battery_capacity integer NOT NULL,
  purchased_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS installed_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vehicle_id uuid REFERENCES user_vehicles(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) NOT NULL,
  position_x integer NOT NULL DEFAULT 0,
  position_y integer NOT NULL DEFAULT 0,
  position_z integer NOT NULL DEFAULT 0,
  rotation integer NOT NULL DEFAULT 0,
  installed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competition_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  min_spl numeric NOT NULL DEFAULT 0,
  max_power_watts integer NOT NULL,
  entry_fee integer NOT NULL,
  prize_money integer NOT NULL,
  difficulty integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS competition_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  user_vehicle_id uuid REFERENCES user_vehicles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES competition_categories(id) NOT NULL,
  user_spl numeric NOT NULL,
  user_rank integer NOT NULL,
  prize_won integer NOT NULL DEFAULT 0,
  ai_scores jsonb DEFAULT '[]'::jsonb,
  competed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Vehicles: public read
CREATE POLICY "Anyone can view vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

-- Equipment categories: public read
CREATE POLICY "Anyone can view equipment categories"
  ON equipment_categories FOR SELECT
  TO authenticated
  USING (true);

-- Equipment: public read
CREATE POLICY "Anyone can view equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

-- Competition categories: public read
CREATE POLICY "Anyone can view competition categories"
  ON competition_categories FOR SELECT
  TO authenticated
  USING (true);

-- User profiles: users can view and update their own
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User vehicles: users can manage their own
CREATE POLICY "Users can view own vehicles"
  ON user_vehicles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vehicles"
  ON user_vehicles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vehicles"
  ON user_vehicles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own vehicles"
  ON user_vehicles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Installed equipment: users can manage their own
CREATE POLICY "Users can view own installed equipment"
  ON installed_equipment FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_vehicles
      WHERE user_vehicles.id = installed_equipment.user_vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own installed equipment"
  ON installed_equipment FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_vehicles
      WHERE user_vehicles.id = installed_equipment.user_vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own installed equipment"
  ON installed_equipment FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_vehicles
      WHERE user_vehicles.id = installed_equipment.user_vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_vehicles
      WHERE user_vehicles.id = installed_equipment.user_vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own installed equipment"
  ON installed_equipment FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_vehicles
      WHERE user_vehicles.id = installed_equipment.user_vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

-- Competition results: users can view own and insert
CREATE POLICY "Users can view own competition results"
  ON competition_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own competition results"
  ON competition_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());