import { Vehicle, InstalledEquipment, Equipment } from '../lib/supabase';
import { useState } from 'react';

interface VehicleVisualizationProps {
  vehicle: Vehicle;
  highlightTrunk?: boolean;
  showStats?: boolean;
  openView?: boolean;
  installedEquipment?: Array<InstalledEquipment & { equipment: Equipment }>;
  isShaking?: boolean;
  glassShattered?: boolean;
}

export default function VehicleVisualization({
  vehicle,
  highlightTrunk = true,
  showStats = false,
  openView = false,
  installedEquipment = [],
  isShaking = false,
  glassShattered = false,
}: VehicleVisualizationProps) {
  const [isOpen, setIsOpen] = useState(openView);

  const getVehiclePath = (type: string) => {
    switch (type) {
      case 'sedan':
        return {
          body: 'M50,150 L50,120 Q50,110 60,110 L90,110 L95,90 Q100,80 110,80 L190,80 Q200,80 205,90 L220,110 L250,110 Q260,110 260,120 L260,150 Z',
          windows: 'M100,100 L110,90 L180,90 L185,100 Z',
          trunk: 'M220,110 L250,110 Q260,110 260,120 L260,150 L220,150 Z',
          trunkOpen: 'M220,110 L250,95 Q260,90 270,95 L280,110 L220,110 Z',
          door: 'M95,110 L95,150 L140,150 L140,110 Z',
          doorOpen: 'M75,110 L75,150 L120,150 L120,110 Z',
          wheels: [{ x: 80, y: 150 }, { x: 230, y: 150 }]
        };
      case 'truck':
        return {
          body: 'M50,140 L50,110 Q50,100 60,100 L100,100 L105,85 Q110,75 120,75 L160,75 Q170,75 175,85 L180,100 L280,100 L280,140 Z',
          windows: 'M115,95 L120,85 L155,85 L160,95 Z',
          trunk: 'M180,100 L280,100 L280,140 L180,140 Z',
          trunkOpen: 'M180,100 L280,85 L295,95 L295,140 L180,140 Z',
          door: 'M105,100 L105,140 L160,140 L160,100 Z',
          doorOpen: 'M85,100 L85,140 L140,140 L140,100 Z',
          wheels: [{ x: 80, y: 140 }, { x: 160, y: 140 }, { x: 250, y: 140 }]
        };
      case 'suv':
        return {
          body: 'M50,145 L50,115 Q50,105 60,105 L95,105 L100,85 Q105,75 115,75 L195,75 Q205,75 210,85 L240,105 L265,105 Q275,105 275,115 L275,145 Z',
          windows: 'M108,98 L115,85 L185,85 L192,98 Z',
          trunk: 'M210,105 L265,105 Q275,105 275,115 L275,145 L210,145 Z',
          trunkOpen: 'M210,105 L265,90 Q280,85 290,95 L290,145 L210,145 Z',
          door: 'M100,105 L100,145 L155,145 L155,105 Z',
          doorOpen: 'M80,105 L80,145 L135,145 L135,105 Z',
          wheels: [{ x: 85, y: 145 }, { x: 240, y: 145 }]
        };
      case 'hatchback':
        return {
          body: 'M50,145 L50,115 Q50,105 60,105 L90,105 L95,88 Q100,78 110,78 L200,78 L205,105 L240,105 Q250,105 250,115 L250,145 Z',
          windows: 'M102,100 L110,88 L185,88 L192,100 Z',
          trunk: 'M200,78 L205,105 L240,105 Q250,105 250,115 L250,145 L200,145 Z',
          trunkOpen: 'M200,78 L210,60 Q220,55 230,60 L255,105 L240,105 Q250,105 250,115 L250,145 L200,145 Z',
          door: 'M95,105 L95,145 L145,145 L145,105 Z',
          doorOpen: 'M75,105 L75,145 L125,145 L125,105 Z',
          wheels: [{ x: 80, y: 145 }, { x: 220, y: 145 }]
        };
      default:
        return {
          body: 'M50,150 L50,120 Q50,110 60,110 L90,110 L95,90 Q100,80 110,80 L190,80 Q200,80 205,90 L220,110 L250,110 Q260,110 260,120 L260,150 Z',
          windows: 'M100,100 L110,90 L180,90 L185,100 Z',
          trunk: 'M220,110 L250,110 Q260,110 260,120 L260,150 L220,150 Z',
          trunkOpen: 'M220,110 L250,95 Q260,90 270,95 L280,110 L220,110 Z',
          door: 'M95,110 L95,150 L140,150 L140,110 Z',
          doorOpen: 'M75,110 L75,150 L120,150 L120,110 Z',
          wheels: [{ x: 80, y: 150 }, { x: 230, y: 150 }]
        };
    }
  };

  const paths = getVehiclePath(vehicle.type);

  return (
    <div className="relative w-full">
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          {isOpen ? 'Close View' : 'Open View'}
        </button>
      </div>

      <svg
        viewBox="0 0 320 200"
        className={`w-full h-full transition-transform duration-300 ${isShaking ? 'animate-shake' : ''}`}
        style={{ maxHeight: '200px' }}
      >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="doorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="trunkHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="trunkNormal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
          </linearGradient>

          <filter id="vehicleShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" />
          </filter>

          <filter id="trunkGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <pattern id="shatteredGlass" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M0,0 L5,10 L0,20 M10,0 L15,10 L10,20 M20,0 L15,10 L20,20 M5,0 L10,5 L15,0" stroke="#60a5fa" strokeWidth="0.5" fill="none" opacity="0.3"/>
          </pattern>
        </defs>

        <path
          d={paths.body}
          fill="url(#bodyGradient)"
          stroke="#334155"
          strokeWidth="2"
          filter="url(#vehicleShadow)"
        />

        {!glassShattered ? (
          <path
            d={paths.windows}
            fill="url(#windowGradient)"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />
        ) : (
          <>
            <path
              d={paths.windows}
              fill="url(#shatteredGlass)"
              stroke="#ef4444"
              strokeWidth="2"
              opacity="0.5"
            />
            {Array.from({ length: 15 }).map((_, i) => (
              <line
                key={i}
                x1={100 + Math.random() * 85}
                y1={85 + Math.random() * 15}
                x2={100 + Math.random() * 85}
                y2={85 + Math.random() * 15}
                stroke="#60a5fa"
                strokeWidth="1"
                opacity={0.6}
                className="animate-pulse"
              />
            ))}
            <text
              x="145"
              y="95"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              className="animate-pulse"
            >
              SHATTERED!
            </text>
          </>
        )}

        {isOpen ? (
          <>
            <path
              d={paths.doorOpen}
              fill="url(#doorGradient)"
              stroke="#94a3b8"
              strokeWidth="3"
              className="animate-fade-in"
            />
            <path
              d={paths.trunkOpen}
              fill={highlightTrunk ? 'url(#trunkHighlight)' : 'url(#trunkNormal)'}
              stroke={highlightTrunk ? '#06b6d4' : '#94a3b8'}
              strokeWidth="3"
              filter={highlightTrunk ? 'url(#trunkGlow)' : undefined}
              className="animate-fade-in"
            />
            {installedEquipment.length > 0 && (
              <>
                {installedEquipment.slice(0, 3).map((item, idx) => (
                  <g key={idx} className="animate-fade-in">
                    <rect
                      x={210 + idx * 15}
                      y={115 + idx * 5}
                      width="12"
                      height="12"
                      fill="#f59e0b"
                      stroke="#fbbf24"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                    <circle
                      cx={216 + idx * 15}
                      cy={121 + idx * 5}
                      r="2"
                      fill="#fef3c7"
                    />
                  </g>
                ))}
                <text
                  x="245"
                  y="125"
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {installedEquipment.length} items
                </text>
              </>
            )}
          </>
        ) : (
          <>
            <path
              d={paths.door}
              fill="url(#doorGradient)"
              stroke="#94a3b8"
              strokeWidth="3"
            />
            {highlightTrunk && (
              <>
                <path
                  d={paths.trunk}
                  fill="url(#trunkHighlight)"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  filter="url(#trunkGlow)"
                  className="animate-pulse"
                />
                <text
                  x="240"
                  y="127"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  className="drop-shadow-lg"
                >
                  TRUNK
                </text>
              </>
            )}
            {!highlightTrunk && (
              <path
                d={paths.trunk}
                fill="url(#trunkNormal)"
                stroke="#94a3b8"
                strokeWidth="3"
              />
            )}
          </>
        )}

        {paths.wheels.map((wheel, idx) => (
          <g key={idx}>
            <circle
              cx={wheel.x}
              cy={wheel.y}
              r="12"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />
            <circle
              cx={wheel.x}
              cy={wheel.y}
              r="8"
              fill="#334155"
              stroke="#475569"
              strokeWidth="1"
            />
            <circle
              cx={wheel.x}
              cy={wheel.y}
              r="3"
              fill="#64748b"
            />
          </g>
        ))}

        <line
          x1="50"
          y1="165"
          x2="280"
          y2="165"
          stroke="#334155"
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>

      {showStats && (
        <div className="mt-2 text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="text-white capitalize">{vehicle.type}</span>
          </div>
          <div className="flex justify-between">
            <span>Trunk Space:</span>
            <span className="text-cyan-400">
              {(vehicle.trunk_width * vehicle.trunk_height * vehicle.trunk_depth / 1000).toFixed(1)}L
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
