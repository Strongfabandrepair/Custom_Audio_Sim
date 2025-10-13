import { useState } from 'react';
import { UserProfile } from '../lib/supabase';
import { Wrench, ShoppingCart, Trophy, LogOut, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Garage from './Garage';
import Shop from './Shop';
import Competition from './Competition';
import BuildStats from './BuildStats';

interface MainGameProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

type View = 'garage' | 'shop' | 'competition' | 'stats';

export default function MainGame({ profile, onProfileUpdate }: MainGameProps) {
  const [currentView, setCurrentView] = useState<View>('garage');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">Bass Master</h1>
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('garage')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'garage'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                  <span>Garage</span>
                </button>
                <button
                  onClick={() => setCurrentView('shop')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'shop'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Shop</span>
                </button>
                <button
                  onClick={() => setCurrentView('competition')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'competition'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  <span>Compete</span>
                </button>
                <button
                  onClick={() => setCurrentView('stats')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'stats'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Stats</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">{profile.username}</div>
                <div className="text-lg font-bold text-green-400">
                  ${profile.cash.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Wins</div>
                <div className="text-lg font-bold text-yellow-400">
                  {profile.competition_wins}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {currentView === 'garage' && (
          <Garage profile={profile} onProfileUpdate={onProfileUpdate} />
        )}
        {currentView === 'shop' && (
          <Shop profile={profile} onProfileUpdate={onProfileUpdate} />
        )}
        {currentView === 'competition' && (
          <Competition profile={profile} onProfileUpdate={onProfileUpdate} />
        )}
        {currentView === 'stats' && (
          <div className="max-w-4xl mx-auto p-6">
            <BuildStats profile={profile} />
          </div>
        )}
      </main>
    </div>
  );
}
