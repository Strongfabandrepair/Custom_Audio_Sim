import { useEffect, useState } from 'react';
import { supabase, Vehicle, UserProfile } from '../lib/supabase';
import { Car, Truck, Box } from 'lucide-react';

interface VehicleSelectionProps {
  profile: UserProfile;
  onVehicleSelected: () => void;
}

export default function VehicleSelection({ profile, onVehicleSelected }: VehicleSelectionProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('base_price', { ascending: true });

    if (data) {
      setVehicles(data);
      setSelectedVehicle(data[0]);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedVehicle) return;

    if (profile.cash < selectedVehicle.base_price) {
      alert('Not enough cash!');
      return;
    }

    setPurchasing(true);

    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('user_vehicles')
        .insert({
          user_id: profile.id,
          vehicle_id: selectedVehicle.id,
          is_active: true,
          alternator_amps: selectedVehicle.stock_alternator_amps,
          battery_capacity: selectedVehicle.stock_battery_capacity,
        })
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ cash: profile.cash - selectedVehicle.base_price })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      onVehicleSelected();
    } catch (error) {
      console.error('Error purchasing vehicle:', error);
      alert('Failed to purchase vehicle');
    } finally {
      setPurchasing(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return <Truck className="w-16 h-16" />;
      case 'suv':
        return <Box className="w-16 h-16" />;
      default:
        return <Car className="w-16 h-16" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Ride</h1>
          <p className="text-gray-400">Select a vehicle to start building your audio system</p>
          <div className="mt-4 inline-block bg-slate-800 px-6 py-3 rounded-lg border border-slate-700">
            <span className="text-gray-400">Available Cash: </span>
            <span className="text-green-400 font-bold text-xl">${profile.cash.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`bg-slate-800 border-2 rounded-xl p-6 transition-all hover:scale-105 ${
                selectedVehicle?.id === vehicle.id
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/50'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-center text-cyan-400 mb-4">
                {getVehicleIcon(vehicle.type)}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{vehicle.name}</h3>
              <div className="text-sm text-gray-400 space-y-1 mb-4">
                <p className="capitalize">Type: {vehicle.type}</p>
                <p>Trunk: {vehicle.trunk_width}x{vehicle.trunk_height}x{vehicle.trunk_depth}cm</p>
                <p>Alternator: {vehicle.stock_alternator_amps}A</p>
                <p>Battery: {vehicle.stock_battery_capacity}Ah</p>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {vehicle.base_price === 0 ? 'FREE' : `$${vehicle.base_price.toLocaleString()}`}
              </div>
            </button>
          ))}
        </div>

        {selectedVehicle && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedVehicle.name}</h2>
                <div className="text-gray-400 space-y-1">
                  <p>Trunk Space: {(selectedVehicle.trunk_width * selectedVehicle.trunk_height * selectedVehicle.trunk_depth / 1000).toFixed(1)}L</p>
                  <p>Electrical Output: {(selectedVehicle.stock_alternator_amps * 14.4).toFixed(0)}W</p>
                  <p>Perfect for building a custom audio system!</p>
                </div>
              </div>
              <button
                onClick={handlePurchase}
                disabled={purchasing || profile.cash < selectedVehicle.base_price}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Purchasing...' : selectedVehicle.base_price === 0 ? 'Select' : `Purchase for $${selectedVehicle.base_price.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
