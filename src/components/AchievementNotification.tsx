import { useEffect, useState } from 'react';
import { Trophy, Sparkles, Zap, Award, Crown, Medal } from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  rarity: string;
  icon: string;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const getIcon = () => {
    switch (achievement.icon) {
      case 'trophy':
        return <Trophy className="w-16 h-16" />;
      case 'sparkles':
        return <Sparkles className="w-16 h-16" />;
      case 'zap':
        return <Zap className="w-16 h-16" />;
      case 'medal':
        return <Medal className="w-16 h-16" />;
      case 'crown':
        return <Crown className="w-16 h-16" />;
      default:
        return <Award className="w-16 h-16" />;
    }
  };

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'from-yellow-600 to-orange-600 border-yellow-500';
      case 'epic':
        return 'from-purple-600 to-pink-600 border-purple-500';
      case 'rare':
        return 'from-blue-600 to-cyan-600 border-blue-500';
      default:
        return 'from-gray-600 to-gray-700 border-gray-500';
    }
  };

  const getRarityText = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'LEGENDARY';
      case 'epic':
        return 'EPIC';
      case 'rare':
        return 'RARE';
      default:
        return 'COMMON';
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-500 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-gradient-to-br ${getRarityColor()} rounded-xl p-6 border-2 shadow-2xl max-w-sm`}>
        <div className="flex items-center space-x-4">
          <div className={`${achievement.rarity === 'legendary' ? 'animate-bounce' : 'animate-pulse'} text-white`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white/80 mb-1">{getRarityText()} ACHIEVEMENT</div>
            <h3 className="text-xl font-bold text-white mb-1">{achievement.name}</h3>
            <p className="text-sm text-white/90">{achievement.description}</p>
          </div>
        </div>

        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
