import { useEffect, useState } from 'react';
import SPLMeter from './SPLMeter';
import VehicleVisualization from './VehicleVisualization';
import { Trophy, Users, Zap } from 'lucide-react';
import { Vehicle, InstalledEquipment, Equipment } from '../lib/supabase';

interface CompetitionAnimationProps {
  categoryName: string;
  userSPL: number;
  username: string;
  vehicle: Vehicle;
  installedEquipment: Array<InstalledEquipment & { equipment: Equipment }>;
  glassShattered: boolean;
  onComplete: () => void;
}

type AnimationStage = 'intro' | 'prep' | 'measuring' | 'complete';

export default function CompetitionAnimation({
  categoryName,
  userSPL,
  username,
  vehicle,
  installedEquipment,
  glassShattered,
  onComplete,
}: CompetitionAnimationProps) {
  const [stage, setStage] = useState<AnimationStage>('intro');
  const [countdown, setCountdown] = useState(3);
  const [showGlassShatter, setShowGlassShatter] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('prep'), 1500);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (stage === 'prep') {
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setStage('measuring');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'measuring') {
      if (glassShattered) {
        const glassTimer = setTimeout(() => {
          setShowGlassShatter(true);
        }, 3500);
      }

      const timer = setTimeout(() => {
        setStage('complete');
        setTimeout(onComplete, 1500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [stage, onComplete, glassShattered]);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-4xl w-full p-8">
        {stage === 'intro' && (
          <div className="text-center animate-fade-in">
            <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-6 animate-bounce" />
            <h1 className="text-5xl font-bold text-white mb-4">{categoryName}</h1>
            <p className="text-2xl text-gray-400">Competitor: {username}</p>
          </div>
        )}

        {stage === 'prep' && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <Users className="w-24 h-24 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Preparing Competition</h2>
              <p className="text-gray-400">Setting up SPL measurement equipment...</p>
            </div>

            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 border-8 border-cyan-500/20 rounded-full"></div>
              <div
                className="absolute inset-0 border-8 border-cyan-500 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl font-bold text-cyan-400">{countdown}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-cyan-400"
                  style={{
                    animation: `pulse 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {stage === 'measuring' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-3xl font-bold text-white mb-2">MEASURING SPL</h2>
              <p className="text-lg text-gray-400">System at full power...</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full bg-cyan-500/5 rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4/5 h-4/5 bg-yellow-500/5 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/5 h-3/5 bg-red-500/5 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
                </div>

                <div className="relative z-10 bg-slate-900/50 rounded-xl p-6 border-2 border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">SPL Reading</h3>
                  <SPLMeter targetSPL={userSPL} duration={4500} showReading={true} />
                  <div className="mt-4 text-center">
                    <div className="text-4xl font-bold text-yellow-400 animate-pulse">
                      {userSPL.toFixed(1)} dB
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Target Level</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-900/50 rounded-xl p-6 border-2 border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">
                    {showGlassShatter ? '💥 GLASS BREAKING! 💥' : 'Vehicle System'}
                  </h3>
                  <div className="max-w-md mx-auto">
                    <VehicleVisualization
                      vehicle={vehicle}
                      highlightTrunk={true}
                      isShaking={true}
                      glassShattered={showGlassShatter}
                      installedEquipment={installedEquipment}
                      openView={true}
                    />
                  </div>
                  {showGlassShatter && (
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                        LEGENDARY ACHIEVEMENT!
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Windows shattered from pure bass power
                      </div>
                    </div>
                  )}
                  {!showGlassShatter && (
                    <div className="mt-4 text-center">
                      <div className="text-sm text-cyan-400 font-semibold">
                        Entire vehicle vibrating
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Equipment visible in trunk
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30 animate-pulse">
                <div className="text-cyan-400 text-sm font-semibold mb-1">Power Draw</div>
                <div className="text-2xl font-bold text-white">MAX</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/30 animate-pulse" style={{ animationDelay: '0.2s' }}>
                <div className="text-yellow-400 text-sm font-semibold mb-1">Frequency</div>
                <div className="text-2xl font-bold text-white">30Hz</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30 animate-pulse" style={{ animationDelay: '0.4s' }}>
                <div className="text-red-400 text-sm font-semibold mb-1">Duration</div>
                <div className="text-2xl font-bold text-white">BURST</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="w-2 h-6 bg-yellow-400 rounded"
                    style={{
                      animation: 'pulse 0.8s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.4 + (Math.random() * 0.6)
                    }}
                  />
                ))}
                <span className="ml-2">Measuring sound waves...</span>
              </div>
            </div>
          </div>
        )}

        {stage === 'complete' && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-green-500/40 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">Measurement Complete!</h2>
              <p className="text-xl text-gray-400">Processing results...</p>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-green-400 animate-pulse"
                  style={{
                    animationDelay: `${i * 200}ms`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
