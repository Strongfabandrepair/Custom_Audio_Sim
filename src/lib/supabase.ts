import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  trunk_width: number;
  trunk_height: number;
  trunk_depth: number;
  cabin_space: number;
  stock_alternator_amps: number;
  stock_battery_capacity: number;
  base_price: number;
  image_url?: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
}

export interface Equipment {
  id: string;
  category_id: string;
  name: string;
  brand: string;
  price: number;
  power_draw_watts: number;
  rms_watts: number;
  spl_rating: number;
  size_width: number;
  size_height: number;
  size_depth: number;
  weight_kg: number;
  specs: Record<string, any>;
}

export interface UserProfile {
  id: string;
  username: string;
  cash: number;
  total_earnings: number;
  competition_wins: number;
  created_at: string;
}

export interface UserVehicle {
  id: string;
  user_id: string;
  vehicle_id: string;
  is_active: boolean;
  alternator_amps: number;
  battery_capacity: number;
  purchased_at: string;
}

export interface InstalledEquipment {
  id: string;
  user_vehicle_id: string;
  equipment_id: string;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation: number;
  installed_at: string;
}

export interface CompetitionCategory {
  id: string;
  name: string;
  min_spl: number;
  max_power_watts: number;
  entry_fee: number;
  prize_money: number;
  difficulty: number;
}

export interface CompetitionResult {
  id: string;
  user_id: string;
  user_vehicle_id: string;
  category_id: string;
  user_spl: number;
  user_rank: number;
  prize_won: number;
  ai_scores: Array<{ name: string; spl: number }>;
  competed_at: string;
}
