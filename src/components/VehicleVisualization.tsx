import { Vehicle } from '../lib/supabase';
import { Car, Truck, Box } from 'lucide-react';

interface VehicleVisualizationProps {
  vehicle: Vehicle;
  highlightTrunk?: boolean;
  showStats?: boolean;
}

export default function VehicleVisualization({
  vehicle,
  highlightTrunk = true,
  showStats = false
}: VehicleVisualizationProps) {
  const getVehiclePath = (type: string) => {
    switch (type) {
      case 'sedan':
        return {
          body: 'M50,150 L50,120 Q50,110 60,110 L90,110 L95,90 Q100,80 110,80 L190,80 Q200,80 205,90 L220,110 L250,110 Q260,110 260,120 L260,150 Z',
          windows: 'M100,100 L110,90 L180,90 L185,100 Z',
          trunk: 'M220,110 L250,110 Q260,110 260,120 L260,150 L220,150 Z',
          wheels: [{ x: 80, y: 150 }, { x: 230, y: 150 }]
        };
      case 'truck':
        return {
          body: 'M50,140 L50,110 Q50,100 60,100 L100,100 L105,85 Q110,75 120,75 L160,75 Q170,75 175,85 L180,100 L280,100 L280,140 Z',
          windows: 'M115,95 L120,85 L155,85 L160,95 Z',
          trunk: 'M180,100 L280,100 L280,140 L180,140 Z',
          wheels: [{ x: 80, y: 140 }, { x: 160, y: 140 }, { x: 250, y: 140 }]
        };
      case 'suv':
        return {
          body: 'M50,145 L50,115 Q50,105 60,105 L95,105 L100,85 Q105,75 115,75 L195,75 Q205,75 210,85 L240,105 L265,105 Q275,105 275,115 L275,145 Z',
          windows: 'M108,98 L115,85 L185,85 L192,98 Z',
          trunk: 'M210,105 L265,105 Q275,105 275,115 L275,145 L210,145 Z',
          wheels: [{ x: 85, y: 145 }, { x: 240, y: 145 }]
        };
      case 'hatchback':
        return {
          body: 'M50,145 L50,115 Q50,105 60,105 L90,105 L95,88 Q100,78 110,78 L200,78 L205,105 L240,105 Q250,105 250,115 L250,145 Z',
          windows: 'M102,100 L110,88 L185,88 L192,100 Z',
          trunk: 'M200,78 L205,105 L240,105 Q250,105 250,115 L250,145 L200,145 Z',
          wheels: [{ x: 80, y: 145 }, { x: 220, y: 145 }]
        };
      default:
        return {
          body: 'M50,150 L50,120 Q50,110 60,110 L90,110 L95,90 Q100,80 110,80 L190,80 Q200,80 205,90 L220,110 L250,110 Q260,110 260,120 L260,150 Z',
          windows: 'M100,100 L110,90 L180,90 L185,100 Z',
          trunk: 'M220,110 L250,110 Q260,110 260,120 L260,150 L220,150 Z',
          wheels: [{ x: 80, y: 150 }, { x: 230, y: 150 }]
        };
    }
  };

  const paths = getVehiclePath(vehicle.type);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 320 200"
        className="w-full h-full"
        style={{ maxHeight: '200px' }}
      >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="trunkHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
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
        </defs>

        <path
          d={paths.body}
          fill="url(#bodyGradient)"
          stroke="#334155"
          strokeWidth="2"
          filter="url(#vehicleShadow)"
        />

        <path
          d={paths.windows}
          fill="url(#windowGradient)"
          stroke="#60a5fa"
          strokeWidth="1.5"
        />

        {highlightTrunk && (
          <>
            <path
              d={paths.trunk}
              fill="url(#trunkHighlight)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              filter="url(#trunkGlow)"
              className="animate-pulse"
            />
            <text
              x="240"
              y="127"
              textAnchor="middle"
              fill="#06b6d4"
              fontSize="10"
              fontWeight="bold"
            >
              TRUNK
            </text>
          </>
        )}

        {!highlightTrunk && (
          <path
            d={paths.trunk}
            fill="url(#bodyGradient)"
            stroke="#334155"
            strokeWidth="2"
          />
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
