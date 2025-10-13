import { useEffect, useState } from 'react';
import { supabase, UserProfile, CompetitionCategory, UserVehicle, Vehicle, InstalledEquipment, Equipment } from '../lib/supabase';
import { GameEngine } from '../lib/gameEngine';
import { Trophy, Zap, DollarSign, Medal, Target } from 'lucide-react';
import CompetitionAnimation from './CompetitionAnimation';
import VehicleVisualization from './VehicleVisualization';

interface CompetitionProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

type EquipmentWithDetails = InstalledEquipment & { equipment: Equipment };

export default function Competition({ profile, onProfileUpdate }: CompetitionProps) {
  const [categories, setCategories] = useState<CompetitionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory | null>(null);
  const [userVehicle, setUserVehicle] = useState<UserVehicle | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [installedEquipment, setInstalledEquipment] = useState<EquipmentWithDetails[]>([]);
  const [userSPL, setUserSPL] = useState(0);
  const [competing, setCompeting] = useState(false);
  const [results, setResults] = useState<{ name: string; spl: number; prize: number; rank: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    const { data: categoriesData } = await supabase
      .from('competition_categories')
      .select('*')
      .order('difficulty');

    if (categoriesData) {
      setCategories(categoriesData);
    }

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
        const equipmentWithDetails = installedData as EquipmentWithDetails[];
        setInstalledEquipment(equipmentWithDetails);

        if (vehicleDetails) {
          const spl = GameEngine.calculateSPL(equipmentWithDetails, vehicleDetails);
          setUserSPL(spl);
        }
      }
    }

    setLoading(false);
  };

  const handleCompete = async (category: CompetitionCategory) => {
    if (!userVehicle || !vehicle) {
      alert('No active vehicle!');
      return;
    }

    if (profile.cash < category.entry_fee) {
      alert('Not enough cash to enter this competition!');
      return;
    }

    if (userSPL < category.min_spl) {
      alert(`Your SPL (${userSPL.toFixed(1)} dB) is below the minimum required (${category.min_spl} dB) for this category!`);
      return;
    }

    const systemStats = GameEngine.calculateSystemStats(installedEquipment, userVehicle, vehicle);

    if (systemStats.totalPowerDraw > category.max_power_watts) {
      alert(`Your system draws ${systemStats.totalPowerDraw}W, exceeding the ${category.max_power_watts}W limit for this class!`);
      return;
    }

    setCompeting(true);
    setSelectedCategory(category);
  };

  const handleAnimationComplete = async () => {
    if (!selectedCategory || !userVehicle || !vehicle) return;

    const aiCompetitors = GameEngine.generateAICompetitors(selectedCategory.difficulty, 5);
    const allScores = [...aiCompetitors, { name: profile.username, spl: userSPL }];
    allScores.sort((a, b) => b.spl - a.spl);

    const userRank = allScores.findIndex(s => s.name === profile.username) + 1;

    const prizes = [
      selectedCategory.prize_money,
      Math.floor(selectedCategory.prize_money * 0.6),
      Math.floor(selectedCategory.prize_money * 0.3),
      0,
      0,
      0
    ];

    const prizeWon = prizes[userRank - 1] || 0;
    const netEarnings = prizeWon - selectedCategory.entry_fee;

    const { error: resultError } = await supabase
      .from('competition_results')
      .insert({
        user_id: profile.id,
        user_vehicle_id: userVehicle.id,
        category_id: selectedCategory.id,
        user_spl: userSPL,
        user_rank: userRank,
        prize_won: prizeWon,
        ai_scores: aiCompetitors,
      });

    if (resultError) {
      console.error('Error saving competition result:', resultError);
    }

    const newCash = profile.cash - selectedCategory.entry_fee + prizeWon;
    const newWins = userRank === 1 ? profile.competition_wins + 1 : profile.competition_wins;
    const newEarnings = profile.total_earnings + netEarnings;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        cash: newCash,
        competition_wins: newWins,
        total_earnings: newEarnings,
      })
      .eq('id', profile.id);

    if (!profileError) {
      onProfileUpdate({
        ...profile,
        cash: newCash,
        competition_wins: newWins,
        total_earnings: newEarnings,
      });
    }

    setResults({
      name: selectedCategory.name,
      spl: userSPL,
      rank: userRank,
      prize: prizeWon,
    });

    setCompeting(false);
  };

  const closeResults = () => {
    setResults(null);
    setSelectedCategory(null);
  };

  const canEnterCategory = (category: CompetitionCategory) => {
    if (!userVehicle || !vehicle) return false;
    if (profile.cash < category.entry_fee) return false;
    if (userSPL < category.min_spl) return false;

    const systemStats = GameEngine.calculateSystemStats(installedEquipment, userVehicle, vehicle);
    if (systemStats.totalPowerDraw > category.max_power_watts) return false;

    return true;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'text-green-400';
    if (difficulty === 2) return 'text-blue-400';
    if (difficulty === 3) return 'text-yellow-400';
    if (difficulty === 4) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading competitions...</div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <div className="mb-6">
            {results.rank === 1 && <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />}
            {results.rank === 2 && <Medal className="w-24 h-24 text-gray-300 mx-auto mb-4" />}
            {results.rank === 3 && <Medal className="w-24 h-24 text-orange-400 mx-auto mb-4" />}
            {results.rank > 3 && <Target className="w-24 h-24 text-gray-500 mx-auto mb-4" />}
          </div>

          <h2 className="text-4xl font-bold text-white mb-2">
            {results.rank === 1 ? '🎉 CHAMPION! 🎉' : results.rank <= 3 ? 'Podium Finish!' : 'Good Effort!'}
          </h2>

          <div className="text-2xl text-gray-300 mb-6">{results.name}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Your SPL</div>
              <div className="text-3xl font-bold text-yellow-400">{results.spl.toFixed(1)} dB</div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Placement</div>
              <div className="text-3xl font-bold text-cyan-400">#{results.rank}</div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Prize</div>
              <div className="text-3xl font-bold text-green-400">${results.prize.toLocaleString()}</div>
            </div>
          </div>

          <button
            onClick={closeResults}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (competing && selectedCategory) {
    return (
      <CompetitionAnimation
        categoryName={selectedCategory.name}
        userSPL={userSPL}
        username={profile.username}
        onComplete={handleAnimationComplete}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold text-white mb-2">SPL Competition</h2>
          <p className="text-gray-400 mb-4">
            Your Current SPL: <span className="text-yellow-400 font-bold text-xl">{userSPL.toFixed(1)} dB</span>
          </p>

          {installedEquipment.length === 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-6 py-4 rounded-lg">
              <p className="font-semibold mb-2">No Equipment Installed</p>
              <p>Visit the shop and garage to build your audio system before competing!</p>
            </div>
          )}
        </div>

        {vehicle && (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-3">Your Build</h3>
            <VehicleVisualization vehicle={vehicle} highlightTrunk={true} showStats={false} />
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Equipment:</span>
                <span className="text-cyan-400">{installedEquipment.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Power:</span>
                <span className="text-yellow-400">
                  {userVehicle && vehicle ? GameEngine.calculateSystemStats(installedEquipment, userVehicle, vehicle).totalRMS : 0}W
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const canEnter = canEnterCategory(category);
          const systemStats = userVehicle && vehicle ? GameEngine.calculateSystemStats(installedEquipment, userVehicle, vehicle) : null;
          const exceedsPowerLimit = systemStats ? systemStats.totalPowerDraw > category.max_power_watts : false;
          const belowMinSPL = userSPL < category.min_spl;
          const cantAfford = profile.cash < category.entry_fee;

          return (
            <div
              key={category.id}
              className={`bg-slate-800 rounded-lg p-6 border transition-all ${
                canEnter ? 'border-slate-700 hover:border-cyan-500' : 'border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Difficulty:</span>
                    <span className={`text-sm font-bold ${getDifficultyColor(category.difficulty)}`}>
                      {'★'.repeat(category.difficulty)}{'☆'.repeat(5 - category.difficulty)}
                    </span>
                  </div>
                </div>
                <Trophy className={`w-12 h-12 ${getDifficultyColor(category.difficulty)}`} />
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className={`font-semibold ${cantAfford ? 'text-red-400' : 'text-white'}`}>
                    ${category.entry_fee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">1st Prize:</span>
                  <span className="text-green-400 font-semibold">${category.prize_money.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Min SPL:</span>
                  <span className={`font-semibold ${belowMinSPL ? 'text-red-400' : 'text-white'}`}>
                    {category.min_spl} dB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Power:</span>
                  <span className={`font-semibold ${exceedsPowerLimit ? 'text-red-400' : 'text-white'}`}>
                    {category.max_power_watts.toLocaleString()}W
                  </span>
                </div>
              </div>

              {!canEnter && (
                <div className="mb-4 text-sm">
                  {cantAfford && <p className="text-red-400">• Not enough cash</p>}
                  {belowMinSPL && <p className="text-red-400">• SPL too low</p>}
                  {exceedsPowerLimit && <p className="text-red-400">• Exceeds power limit</p>}
                </div>
              )}

              <button
                onClick={() => handleCompete(category)}
                disabled={!canEnter}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  canEnter
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canEnter ? 'Enter Competition' : 'Requirements Not Met'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
