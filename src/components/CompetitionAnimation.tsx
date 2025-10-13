import { useEffect, useState } from 'react';
import SPLMeter from './SPLMeter';
import { Trophy, Users, Zap } from 'lucide-react';

interface CompetitionAnimationProps {
  categoryName: string;
  userSPL: number;
  username: string;
  onComplete: () => void;
}

type AnimationStage = 'intro' | 'prep' | 'measuring' | 'complete';

export default function CompetitionAnimation({
  categoryName,
  userSPL,
  username,
  onComplete,
}: CompetitionAnimationProps) {
  const [stage, setStage] = useState<AnimationStage>('intro');
  const [countdown, setCountdown] = useState(3);

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
      const timer = setTimeout(() => {
        setStage('complete');
        setTimeout(onComplete, 1500);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

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
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <Zap className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-4xl font-bold text-white mb-2">MEASURING SPL</h2>
              <p className="text-xl text-gray-400">System at full power...</p>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-cyan-500/10 rounded-full animate-ping"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-yellow-500/10 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-red-500/10 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
              </div>
              <div className="relative z-10">
                <SPLMeter targetSPL={userSPL} duration={2000} showReading={true} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30">
                <div className="text-cyan-400 text-sm font-semibold mb-1">Power Draw</div>
                <div className="text-2xl font-bold text-white">MAX</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/30">
                <div className="text-yellow-400 text-sm font-semibold mb-1">Frequency</div>
                <div className="text-2xl font-bold text-white">30Hz</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
                <div className="text-red-400 text-sm font-semibold mb-1">Duration</div>
                <div className="text-2xl font-bold text-white">BURST</div>
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
