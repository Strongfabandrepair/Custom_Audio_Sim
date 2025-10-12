import { useEffect, useState } from 'react';
import { supabase, UserProfile } from './lib/supabase';
import Auth from './components/Auth';
import VehicleSelection from './components/VehicleSelection';
import MainGame from './components/MainGame';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setHasVehicle(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      const { data: vehicleData } = await supabase
        .from('user_vehicles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      setHasVehicle(!!vehicleData);
    }
    setLoading(false);
  };

  const handleProfileCreated = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleVehicleSelected = () => {
    setHasVehicle(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onProfileCreated={handleProfileCreated} />;
  }

  if (!hasVehicle) {
    return <VehicleSelection profile={profile!} onVehicleSelected={handleVehicleSelected} />;
  }

  return <MainGame profile={profile!} onProfileUpdate={setProfile} />;
}

export default App;
