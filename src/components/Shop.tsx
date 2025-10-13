import { useEffect, useState } from 'react';
import { supabase, Equipment, EquipmentCategory, UserProfile, UserVehicle, InstalledEquipment } from '../lib/supabase';
import { Filter, Search, Zap, Volume2, Radio, Battery, Lightbulb, Shield } from 'lucide-react';
import Equipment3D from './Equipment3D';

interface ShopProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export default function Shop({ profile, onProfileUpdate }: ShopProps) {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userVehicle, setUserVehicle] = useState<UserVehicle | null>(null);
  const [installedEquipment, setInstalledEquipment] = useState<InstalledEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  useEffect(() => {
    filterEquipment();
  }, [selectedCategory, searchQuery, equipment]);

  const loadData = async () => {
    const [categoriesRes, equipmentRes, vehicleRes] = await Promise.all([
      supabase.from('equipment_categories').select('*').order('name'),
      supabase.from('equipment').select('*').order('price'),
      supabase.from('user_vehicles').select('*').eq('user_id', profile.id).eq('is_active', true).maybeSingle()
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (equipmentRes.data) setEquipment(equipmentRes.data);
    if (vehicleRes.data) {
      setUserVehicle(vehicleRes.data);
      const { data: installedData } = await supabase
        .from('installed_equipment')
        .select('equipment_id')
        .eq('user_vehicle_id', vehicleRes.data.id);
      if (installedData) setInstalledEquipment(installedData);
    }

    setLoading(false);
  };

  const filterEquipment = () => {
    let filtered = equipment;

    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.name === selectedCategory);
      if (category) {
        filtered = filtered.filter(e => e.category_id === category.id);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEquipment(filtered);
  };

  const handlePurchase = async (item: Equipment) => {
    if (profile.cash < item.price) {
      alert('Not enough cash!');
      return;
    }

    if (!userVehicle) {
      alert('No active vehicle!');
      return;
    }

    const { error: equipmentError } = await supabase
      .from('installed_equipment')
      .insert({
        user_vehicle_id: userVehicle.id,
        equipment_id: item.id,
        position_x: 50,
        position_y: 50,
        position_z: 50,
        rotation: 0,
      });

    if (equipmentError) {
      console.error('Error installing equipment:', equipmentError);
      alert('Failed to install equipment');
      return;
    }

    const newCash = profile.cash - item.price;
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ cash: newCash })
      .eq('id', profile.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }

    onProfileUpdate({ ...profile, cash: newCash });
    await loadData();
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'subwoofer':
        return <Volume2 className="w-5 h-5" />;
      case 'amplifier':
        return <Zap className="w-5 h-5" />;
      case 'speaker':
      case 'head_unit':
        return <Radio className="w-5 h-5" />;
      case 'battery':
      case 'alternator':
      case 'capacitor':
        return <Battery className="w-5 h-5" />;
      case 'led_lighting':
        return <Lightbulb className="w-5 h-5" />;
      case 'sound_deadening':
        return <Shield className="w-5 h-5" />;
      default:
        return <Filter className="w-5 h-5" />;
    }
  };

  const isOwned = (equipmentId: string) => {
    return installedEquipment.some(e => e.equipment_id === equipmentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading shop...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Equipment Shop</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.name
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {getCategoryIcon(category.name)}
              <span className="capitalize">{category.name.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => {
          const owned = isOwned(item.id);
          const canAfford = profile.cash >= item.price;

          return (
            <div
              key={item.id}
              className={`bg-slate-800 rounded-lg p-4 border transition-all hover:scale-105 ${
                owned ? 'border-green-500' : 'border-slate-700'
              }`}
            >
              <div className="mb-3 h-32 flex items-center justify-center bg-slate-900 rounded-lg">
                <Equipment3D equipment={item} />
              </div>

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.brand}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-400">
                    ${item.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-300 mb-4">
                {item.rms_watts > 0 && (
                  <div className="flex justify-between">
                    <span>RMS Power:</span>
                    <span className="text-cyan-400">{item.rms_watts}W</span>
                  </div>
                )}
                {item.spl_rating > 0 && (
                  <div className="flex justify-between">
                    <span>SPL Rating:</span>
                    <span className="text-yellow-400">{item.spl_rating.toFixed(1)} dB</span>
                  </div>
                )}
                {item.power_draw_watts > 0 && (
                  <div className="flex justify-between">
                    <span>Power Draw:</span>
                    <span className="text-red-400">{item.power_draw_watts}W</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{item.size_width}x{item.size_height}x{item.size_depth}cm</span>
                </div>
              </div>

              <button
                onClick={() => handlePurchase(item)}
                disabled={!canAfford || owned}
                className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                  owned
                    ? 'bg-green-900 text-green-300 cursor-not-allowed'
                    : canAfford
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {owned ? 'Owned' : canAfford ? 'Purchase' : 'Not Enough Cash'}
              </button>
            </div>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p>No equipment found matching your search.</p>
        </div>
      )}
    </div>
  );
}
