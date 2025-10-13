import { useEffect, useState } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import { TrendingUp, Trophy, DollarSign, Award } from 'lucide-react';

interface BuildStatsProps {
  profile: UserProfile;
}

interface CompetitionStats {
  total_competitions: number;
  highest_spl: number;
  best_placement: number;
  favorite_category: string;
}

export default function BuildStats({ profile }: BuildStatsProps) {
  const [stats, setStats] = useState<CompetitionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profile.id]);

  const loadStats = async () => {
    const { data: results } = await supabase
      .from('competition_results')
      .select('user_spl, user_rank, category_id, competition_categories(name)')
      .eq('user_id', profile.id)
      .order('competed_at', { ascending: false });

    if (results && results.length > 0) {
      const totalCompetitions = results.length;
      const highestSPL = Math.max(...results.map(r => r.user_spl));
      const bestPlacement = Math.min(...results.map(r => r.user_rank));

      const categoryCount: Record<string, number> = {};
      results.forEach(r => {
        const catName = (r.competition_categories as any)?.name || 'Unknown';
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      });

      const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0];

      setStats({
        total_competitions: totalCompetitions,
        highest_spl: highestSPL,
        best_placement: bestPlacement,
        favorite_category: favoriteCategory,
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Career Statistics</h3>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Career Statistics</h3>
        <p className="text-gray-400">No competition history yet. Enter your first competition!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Career Statistics</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-gray-400">Competitions</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total_competitions}</div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Wins</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{profile.competition_wins}</div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Best Rank</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">#{stats.best_placement}</div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${profile.total_earnings.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Highest SPL</span>
          <span className="text-lg font-bold text-yellow-400">{stats.highest_spl.toFixed(1)} dB</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-400">Favorite Category</span>
          <span className="text-sm font-semibold text-cyan-400">{stats.favorite_category}</span>
        </div>
      </div>
    </div>
  );
}
