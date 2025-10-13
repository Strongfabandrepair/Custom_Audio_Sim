import { useEffect, useState } from 'react';

interface SPLMeterProps {
  targetSPL: number;
  duration?: number;
  showReading?: boolean;
}

export default function SPLMeter({ targetSPL, duration = 2000, showReading = true }: SPLMeterProps) {
  const [currentSPL, setCurrentSPL] = useState(0);
  const [peaked, setPeaked] = useState(false);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const noise = Math.sin(elapsed * 0.02) * 2;
      const newSPL = targetSPL * easeOutCubic + noise;

      setCurrentSPL(newSPL);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setPeaked(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetSPL, duration]);

  const minSPL = 60;
  const maxSPL = 160;
  const normalizedSPL = Math.max(minSPL, Math.min(maxSPL, currentSPL));
  const percentage = ((normalizedSPL - minSPL) / (maxSPL - minSPL)) * 100;

  const getColor = (spl: number) => {
    if (spl < 80) return '#10b981';
    if (spl < 90) return '#22d3ee';
    if (spl < 100) return '#fbbf24';
    if (spl < 110) return '#f59e0b';
    if (spl < 120) return '#ef4444';
    return '#dc2626';
  };

  const color = getColor(normalizedSPL);

  const segments = 20;
  const segmentHeight = 300 / segments;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-80 bg-slate-900 rounded-2xl border-4 border-slate-700 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950 opacity-50"></div>

        <div className="absolute inset-0 flex flex-col-reverse p-2 space-y-reverse space-y-1">
          {Array.from({ length: segments }).map((_, i) => {
            const segmentSPL = minSPL + ((maxSPL - minSPL) / segments) * (i + 1);
            const isActive = normalizedSPL >= segmentSPL;
            const segmentColor = getColor(segmentSPL);

            return (
              <div
                key={i}
                className={`h-3 rounded transition-all duration-100 ${
                  isActive ? 'opacity-100' : 'opacity-20'
                }`}
                style={{
                  backgroundColor: isActive ? segmentColor : '#334155',
                  boxShadow: isActive ? `0 0 10px ${segmentColor}` : 'none',
                }}
              ></div>
            );
          })}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {peaked && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white animate-pulse"></div>
        )}
      </div>

      {showReading && (
        <div className="mt-4 text-center">
          <div
            className="text-6xl font-bold transition-colors duration-300"
            style={{ color }}
          >
            {normalizedSPL.toFixed(1)}
          </div>
          <div className="text-xl text-gray-400 font-semibold">dB SPL</div>
        </div>
      )}

      <div className="mt-4 flex items-center space-x-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
