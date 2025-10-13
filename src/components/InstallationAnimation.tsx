import { useEffect, useState } from 'react';
import { Wrench, Zap, Check, Package } from 'lucide-react';

interface InstallationAnimationProps {
  items: Array<{ name: string; type: 'equipment' | 'electrical' }>;
  onComplete: () => void;
}

type Stage = 'preparing' | 'installing' | 'testing' | 'complete';

export default function InstallationAnimation({ items, onComplete }: InstallationAnimationProps) {
  const [stage, setStage] = useState<Stage>('preparing');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('installing'), 800);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (stage === 'installing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            if (currentItemIndex < items.length - 1) {
              setCurrentItemIndex(prev => prev + 1);
              return 0;
            } else {
              setStage('testing');
              return 100;
            }
          }
          return prev + 5;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [stage, currentItemIndex, items.length]);

  useEffect(() => {
    if (stage === 'testing') {
      const timer = setTimeout(() => {
        setStage('complete');
        setTimeout(onComplete, 1000);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  const currentItem = items[currentItemIndex];

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <div className="bg-slate-800 rounded-xl p-8 border-2 border-slate-700 shadow-2xl">
          {stage === 'preparing' && (
            <div className="text-center animate-fade-in">
              <Package className="w-20 h-20 text-cyan-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-white mb-2">Preparing Installation</h2>
              <p className="text-gray-400">Getting tools ready...</p>
            </div>
          )}

          {stage === 'installing' && currentItem && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Wrench className="w-12 h-12 text-cyan-400 animate-pulse" />
                    <div className="absolute -top-1 -right-1">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Installing</h3>
                    <p className="text-gray-400 text-sm">
                      {currentItemIndex + 1} of {items.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">{progress}%</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{currentItem.name}</span>
                  <span className="text-xs text-gray-400 uppercase">
                    {currentItem.type}
                  </span>
                </div>
                <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-center transition-all ${
                      idx < currentItemIndex
                        ? 'bg-green-900/50 border border-green-500'
                        : idx === currentItemIndex
                        ? 'bg-cyan-900/50 border border-cyan-500 scale-105'
                        : 'bg-slate-900/50 border border-slate-700'
                    }`}
                  >
                    {idx < currentItemIndex && (
                      <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    )}
                    {idx === currentItemIndex && (
                      <Wrench className="w-5 h-5 text-cyan-400 mx-auto mb-1 animate-pulse" />
                    )}
                    {idx > currentItemIndex && (
                      <Package className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    )}
                    <div className="text-xs text-gray-400 truncate">{item.name}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center space-x-4">
                <div className="flex space-x-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-cyan-400 rounded"
                      style={{
                        animation: 'pulse 1s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                        opacity: 0.3 + (Math.random() * 0.7)
                      }}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-400">Working...</div>
              </div>
            </div>
          )}

          {stage === 'testing' && (
            <div className="text-center animate-fade-in">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 border-8 border-cyan-500/20 rounded-full"></div>
                <div
                  className="absolute inset-0 border-8 border-cyan-500 rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                ></div>
                <Zap className="absolute inset-0 m-auto w-16 h-16 text-yellow-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Testing System</h2>
              <p className="text-gray-400">Checking electrical connections...</p>
            </div>
          )}

          {stage === 'complete' && (
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-green-500/40 rounded-full flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Installation Complete!</h2>
              <p className="text-green-400">All systems operational</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
