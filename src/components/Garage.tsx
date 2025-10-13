import { useEffect, useState } from 'react';
import { supabase, UserProfile, UserVehicle, Vehicle, InstalledEquipment, Equipment } from '../lib/supabase';
import { GameEngine, SystemStats } from '../lib/gameEngine';
import { Gauge, Battery, Zap, Volume2, Trash2, RotateCw, Eye, Save } from 'lucide-react';
import Trunk3D from './Trunk3D';
import VehicleVisualization from './VehicleVisualization';
import InstallationAnimation from './InstallationAnimation';

interface GarageProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

type EquipmentWithDetails = InstalledEquipment & { equipment: Equipment };

export default function Garage({ profile, onProfileUpdate }: GarageProps) {
  const [userVehicle, setUserVehicle] = useState<UserVehicle | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [installedEquipment, setInstalledEquipment] = useState<EquipmentWithDetails[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<EquipmentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [view3D, setView3D] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Array<{ name: string; type: 'equipment' | 'electrical' }>>([]);
  const [showInstallAnimation, setShowInstallAnimation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadGarage();
  }, [profile.id]);

  useEffect(() => {
    if (userVehicle && vehicle && installedEquipment.length >= 0) {
      const stats = GameEngine.calculateSystemStats(installedEquipment, userVehicle, vehicle);
      setSystemStats(stats);
    }
  }, [installedEquipment, userVehicle, vehicle]);

  const loadGarage = async () => {
    const { data: vehicleData } = await supabase
      .from('user_vehicles')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .maybeSingle();

    if (vehicleData) {
      setUserVehicle(vehicleData);

      const { data: vehicleDetails } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleData.vehicle_id)
        .single();

      if (vehicleDetails) {
        setVehicle(vehicleDetails);
      }

      const { data: installedData } = await supabase
        .from('installed_equipment')
        .select('*, equipment(*)')
        .eq('user_vehicle_id', vehicleData.id);

      if (installedData) {
        setInstalledEquipment(installedData as EquipmentWithDetails[]);
      }
    }

    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, item: EquipmentWithDetails) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !vehicle) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * vehicle.trunk_width;
    const rawY = ((e.clientY - rect.top) / rect.height) * vehicle.trunk_height;

    const gridSize = 5;
    const x = Math.round(rawX / gridSize) * gridSize;
    const y = Math.round(rawY / gridSize) * gridSize;
    const z = draggedItem.position_z;

    const halfWidth = draggedItem.equipment.size_width / 2;
    const halfHeight = draggedItem.equipment.size_height / 2;

    const clampedX = Math.max(halfWidth, Math.min(vehicle.trunk_width - halfWidth, x));
    const clampedY = Math.max(halfHeight, Math.min(vehicle.trunk_height - halfHeight, y));

    const inBounds = GameEngine.checkBounds(
      clampedX, clampedY, z,
      draggedItem.equipment.size_width,
      draggedItem.equipment.size_height,
      draggedItem.equipment.size_depth,
      vehicle
    );

    if (!inBounds) {
      alert('Equipment would be out of bounds!');
      setDraggedItem(null);
      return;
    }

    const otherEquipment = installedEquipment.filter(item => item.id !== draggedItem.id);
    const hasCollision = GameEngine.checkCollision(
      clampedX, clampedY, z,
      draggedItem.equipment.size_width,
      draggedItem.equipment.size_height,
      draggedItem.equipment.size_depth,
      otherEquipment
    );

    if (hasCollision) {
      alert('Equipment would overlap with existing items!');
      setDraggedItem(null);
      return;
    }

    const { error } = await supabase
      .from('installed_equipment')
      .update({
        position_x: Math.round(clampedX),
        position_y: Math.round(clampedY),
      })
      .eq('id', draggedItem.id);

    if (!error) {
      await loadGarage();
    }

    setDraggedItem(null);
  };

  const handleRemoveEquipment = async (item: EquipmentWithDetails) => {
    if (!confirm('Remove this equipment? You will get 50% refund.')) return;

    const refund = Math.floor(item.equipment.price * 0.5);

    const { error: deleteError } = await supabase
      .from('installed_equipment')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      alert('Failed to remove equipment');
      return;
    }

    const newCash = profile.cash + refund;
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ cash: newCash })
      .eq('id', profile.id);

    if (!profileError) {
      onProfileUpdate({ ...profile, cash: newCash });
      await loadGarage();
    }
  };

  const handleRotateEquipment = async (item: EquipmentWithDetails) => {
    const newRotation = (item.rotation + 90) % 360;

    const { error } = await supabase
      .from('installed_equipment')
      .update({ rotation: newRotation })
      .eq('id', item.id);

    if (!error) {
      await loadGarage();
    }
  };

  const upgradeAlternator = async () => {
    if (!userVehicle) return;

    const cost = 400;
    const upgrade = 100;

    if (profile.cash < cost) {
      alert('Not enough cash!');
      return;
    }

    const newAmps = userVehicle.alternator_amps + upgrade;

    const { error: vehicleError } = await supabase
      .from('user_vehicles')
      .update({ alternator_amps: newAmps })
      .eq('id', userVehicle.id);

    if (vehicleError) return;

    const newCash = profile.cash - cost;
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ cash: newCash })
      .eq('id', profile.id);

    if (!profileError) {
      onProfileUpdate({ ...profile, cash: newCash });
      setPendingChanges(prev => [...prev, { name: `+${upgrade}A Alternator`, type: 'electrical' }]);
      setHasUnsavedChanges(true);
      await loadGarage();
    }
  };

  const upgradeBattery = async () => {
    if (!userVehicle) return;

    const cost = 200;
    const upgrade = 25;

    if (profile.cash < cost) {
      alert('Not enough cash!');
      return;
    }

    const newCapacity = userVehicle.battery_capacity + upgrade;

    const { error: vehicleError } = await supabase
      .from('user_vehicles')
      .update({ battery_capacity: newCapacity })
      .eq('id', userVehicle.id);

    if (vehicleError) return;

    const newCash = profile.cash - cost;
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ cash: newCash })
      .eq('id', profile.id);

    if (!profileError) {
      onProfileUpdate({ ...profile, cash: newCash });
      setPendingChanges(prev => [...prev, { name: `+${upgrade}Ah Battery`, type: 'electrical' }]);
      setHasUnsavedChanges(true);
      await loadGarage();
    }
  };

  const handleSaveChanges = () => {
    if (pendingChanges.length > 0) {
      setShowInstallAnimation(true);
    }
  };

  const handleInstallationComplete = () => {
    setShowInstallAnimation(false);
    setPendingChanges([]);
    setHasUnsavedChanges(false);
  };

  if (loading || !vehicle || !userVehicle) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading garage...</div>
      </div>
    );
  }

  const scale = 4;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {showInstallAnimation && (
        <InstallationAnimation
          items={pendingChanges}
          onComplete={handleInstallationComplete}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Your Garage - {vehicle.name}</h2>
        {hasUnsavedChanges && (
          <button
            onClick={handleSaveChanges}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors animate-pulse"
          >
            <Save className="w-5 h-5" />
            <span>Save & Install Changes</span>
          </button>
        )}
      </div>

      <div className="mb-6">
        <VehicleVisualization vehicle={vehicle} highlightTrunk={true} showStats={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Estimated SPL</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">
              {systemStats?.estimatedSPL.toFixed(1) || '0.0'} dB
            </span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">Power System</span>
            </div>
            <span className={`text-2xl font-bold ${
              (systemStats?.electricalEfficiency || 0) > 60 ? 'text-green-400' :
              (systemStats?.electricalEfficiency || 0) > 30 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {systemStats?.electricalEfficiency.toFixed(0) || '0'}%
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {systemStats?.totalPowerDraw || 0}W / {systemStats?.availablePower.toFixed(0) || 0}W
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Total RMS</span>
            </div>
            <span className="text-2xl font-bold text-purple-400">
              {systemStats?.totalRMS || 0}W
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Trunk Space</h3>
              <button
                onClick={() => setView3D(!view3D)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>{view3D ? '2D View' : '3D View'}</span>
              </button>
            </div>

            {view3D ? (
              <div onDragOver={handleDragOver} onDrop={handleDrop}>
                <Trunk3D
                  vehicle={vehicle}
                  installedEquipment={installedEquipment}
                  selectedEquipment={selectedEquipment}
                  onSelectEquipment={(id) => setSelectedEquipment(selectedEquipment === id ? null : id)}
                  onDragStart={handleDragStart}
                />
              </div>
            ) : (
              <div
                className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg overflow-hidden"
                style={{
                  height: `${vehicle.trunk_height * scale}px`,
                  border: '4px solid #06b6d4',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
                    `,
                    backgroundSize: `${vehicle.trunk_width * scale / 10}px ${vehicle.trunk_height * scale / 10}px`
                  }}
                />
                <div className="absolute top-2 left-2 text-xs text-cyan-400 font-mono bg-slate-900/80 px-2 py-1 rounded">
                  {vehicle.trunk_width}x{vehicle.trunk_height}cm
                </div>
                <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono bg-slate-900/80 px-2 py-1 rounded">
                  Drag to position
                </div>

                {installedEquipment.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => setSelectedEquipment(selectedEquipment === item.id ? null : item.id)}
                    className={`absolute cursor-grab active:cursor-grabbing transition-all ${
                      selectedEquipment === item.id
                        ? 'ring-4 ring-cyan-400 z-10 scale-105'
                        : 'hover:ring-2 hover:ring-cyan-400 hover:scale-102'
                    }`}
                    style={{
                      left: `${(item.position_x / vehicle.trunk_width) * 100}%`,
                      top: `${(item.position_y / vehicle.trunk_height) * 100}%`,
                      width: `${item.equipment.size_width * scale}px`,
                      height: `${item.equipment.size_height * scale}px`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                      backgroundColor: selectedEquipment === item.id ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.3)',
                      border: `3px solid ${selectedEquipment === item.id ? '#22d3ee' : '#06b6d4'}`,
                      boxShadow: selectedEquipment === item.id
                        ? '0 0 20px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="text-xs text-white font-semibold p-1 truncate bg-slate-900/60 rounded">
                      {item.equipment.name}
                    </div>
                    <div className="absolute bottom-0 right-0 text-[10px] text-cyan-300 bg-slate-900/80 px-1 rounded-tl">
                      {item.equipment.size_width}x{item.equipment.size_height}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
              <span>💡 Drag equipment to reposition • Click to select • Snaps to 5cm grid</span>
              <span className="text-cyan-400">{installedEquipment.length} items installed</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-3">Electrical Upgrades</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Alternator</span>
                  <span className="text-white">{userVehicle.alternator_amps}A</span>
                </div>
                <button
                  onClick={upgradeAlternator}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm py-2 rounded transition-colors"
                >
                  Upgrade +100A ($400)
                </button>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Battery</span>
                  <span className="text-white">{userVehicle.battery_capacity}Ah</span>
                </div>
                <button
                  onClick={upgradeBattery}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm py-2 rounded transition-colors"
                >
                  Upgrade +25Ah ($200)
                </button>
              </div>
            </div>
          </div>

          {selectedEquipment && (
            <div className="bg-slate-800 rounded-lg p-4 border border-cyan-500">
              <h3 className="text-lg font-bold text-white mb-3">Selected Equipment</h3>
              {(() => {
                const item = installedEquipment.find(e => e.id === selectedEquipment);
                if (!item) return null;

                return (
                  <div>
                    <p className="text-white font-semibold mb-2">{item.equipment.name}</p>
                    <div className="space-y-2 mb-3">
                      <button
                        onClick={() => handleRotateEquipment(item)}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition-colors"
                      >
                        <RotateCw className="w-4 h-4" />
                        <span>Rotate</span>
                      </button>
                      <button
                        onClick={() => handleRemoveEquipment(item)}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove (50% refund)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Installed Equipment</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {installedEquipment.length === 0 ? (
                <p className="text-gray-400 text-sm">No equipment installed. Visit the shop!</p>
              ) : (
                installedEquipment.map((item) => (
                  <div
                    key={item.id}
                    className="text-sm text-gray-300 p-2 bg-slate-900 rounded cursor-pointer hover:bg-slate-700"
                    onClick={() => setSelectedEquipment(item.id)}
                  >
                    {item.equipment.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
