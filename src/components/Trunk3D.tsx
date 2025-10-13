import { Equipment, InstalledEquipment, Vehicle } from '../lib/supabase';

interface Trunk3DProps {
  vehicle: Vehicle;
  installedEquipment: Array<InstalledEquipment & { equipment: Equipment }>;
  selectedEquipment: string | null;
  onSelectEquipment: (id: string) => void;
  onDragStart: (e: React.DragEvent, item: InstalledEquipment & { equipment: Equipment }) => void;
}

export default function Trunk3D({
  vehicle,
  installedEquipment,
  selectedEquipment,
  onSelectEquipment,
  onDragStart,
}: Trunk3DProps) {
  const viewWidth = 800;
  const viewHeight = 600;
  const perspective = 800;

  const scale = Math.min(
    viewWidth / vehicle.trunk_width,
    viewHeight / vehicle.trunk_depth
  ) * 0.7;

  const centerX = viewWidth / 2;
  const centerY = viewHeight / 2;

  const getEquipmentColor = (categoryId: string, isSelected: boolean) => {
    if (isSelected) return '#06b6d4';

    const colors: Record<string, string> = {
      subwoofer: '#f59e0b',
      amplifier: '#ef4444',
      speaker: '#8b5cf6',
      battery: '#10b981',
      alternator: '#3b82f6',
      capacitor: '#ec4899',
      led_lighting: '#fbbf24',
      sound_deadening: '#6b7280',
    };

    return colors[categoryId] || '#06b6d4';
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg overflow-hidden border-2 border-slate-700">
      <svg
        width={viewWidth}
        height={viewHeight}
        style={{ perspective: `${perspective}px` }}
        className="w-full h-full"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      >
        <defs>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.5" />
          </filter>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polygon
          points={`
            ${centerX - vehicle.trunk_width * scale / 2},${centerY + vehicle.trunk_depth * scale / 3}
            ${centerX + vehicle.trunk_width * scale / 2},${centerY + vehicle.trunk_depth * scale / 3}
            ${centerX + vehicle.trunk_width * scale / 2 + 50},${centerY - vehicle.trunk_depth * scale / 3}
            ${centerX - vehicle.trunk_width * scale / 2 + 50},${centerY - vehicle.trunk_depth * scale / 3}
          `}
          fill="url(#trunkGradient)"
          stroke="#475569"
          strokeWidth="2"
        />

        <line
          x1={centerX - vehicle.trunk_width * scale / 2}
          y1={centerY + vehicle.trunk_depth * scale / 3}
          x2={centerX - vehicle.trunk_width * scale / 2 + 50}
          y2={centerY - vehicle.trunk_depth * scale / 3}
          stroke="#475569"
          strokeWidth="2"
        />

        <line
          x1={centerX + vehicle.trunk_width * scale / 2}
          y1={centerY + vehicle.trunk_depth * scale / 3}
          x2={centerX + vehicle.trunk_width * scale / 2 + 50}
          y2={centerY - vehicle.trunk_depth * scale / 3}
          stroke="#475569"
          strokeWidth="2"
        />

        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`grid-h-${i}`}
            x1={centerX - vehicle.trunk_width * scale / 2 + (i * 50)}
            y1={centerY + vehicle.trunk_depth * scale / 3}
            x2={centerX - vehicle.trunk_width * scale / 2 + 50 + (i * 50)}
            y2={centerY - vehicle.trunk_depth * scale / 3}
            stroke="#334155"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {Array.from({ length: 5 }).map((_, i) => {
          const y = centerY + vehicle.trunk_depth * scale / 3 - (i * vehicle.trunk_depth * scale / 5);
          const offset = (i / 5) * 50;
          return (
            <line
              key={`grid-v-${i}`}
              x1={centerX - vehicle.trunk_width * scale / 2 + offset}
              y1={y}
              x2={centerX + vehicle.trunk_width * scale / 2 + offset}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {installedEquipment.map((item) => {
          const x = centerX - vehicle.trunk_width * scale / 2 + (item.position_x / vehicle.trunk_width) * vehicle.trunk_width * scale;
          const z = item.position_z / vehicle.trunk_depth;
          const y = centerY + vehicle.trunk_depth * scale / 3 - z * vehicle.trunk_depth * scale;

          const depthOffset = z * 50;
          const adjustedX = x + depthOffset;

          const width = item.equipment.size_width * scale;
          const depth = item.equipment.size_depth * scale;

          const isSelected = selectedEquipment === item.id;
          const color = getEquipmentColor(item.equipment.category_id, isSelected);

          const rotation = item.rotation;
          const radians = (rotation * Math.PI) / 180;
          const cos = Math.cos(radians);
          const sin = Math.sin(radians);

          const corners = [
            { x: -width / 2, y: -depth / 2 },
            { x: width / 2, y: -depth / 2 },
            { x: width / 2, y: depth / 2 },
            { x: -width / 2, y: depth / 2 },
          ];

          const rotatedCorners = corners.map(corner => ({
            x: adjustedX + corner.x * cos - corner.y * sin,
            y: y + corner.x * sin + corner.y * sin * 0.5,
          }));

          const topCorners = rotatedCorners.map(corner => ({
            x: corner.x + 20,
            y: corner.y - item.equipment.size_height * 0.5,
          }));

          return (
            <g
              key={item.id}
              style={{ cursor: 'move' }}
              filter={isSelected ? 'url(#glow)' : 'url(#shadow)'}
              onClick={() => onSelectEquipment(item.id)}
            >
              <polygon
                points={rotatedCorners.map(c => `${c.x},${c.y}`).join(' ')}
                fill={color}
                fillOpacity="0.7"
                stroke={isSelected ? '#06b6d4' : color}
                strokeWidth={isSelected ? '3' : '2'}
              />

              <polygon
                points={topCorners.map(c => `${c.x},${c.y}`).join(' ')}
                fill={color}
                fillOpacity="0.5"
                stroke={isSelected ? '#06b6d4' : color}
                strokeWidth={isSelected ? '3' : '2'}
              />

              {[0, 1, 2, 3].map(i => (
                <line
                  key={i}
                  x1={rotatedCorners[i].x}
                  y1={rotatedCorners[i].y}
                  x2={topCorners[i].x}
                  y2={topCorners[i].y}
                  stroke={isSelected ? '#06b6d4' : color}
                  strokeWidth={isSelected ? '2' : '1'}
                  opacity="0.8"
                />
              ))}

              <text
                x={adjustedX}
                y={y}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {item.equipment.name.length > 15
                  ? item.equipment.name.substring(0, 12) + '...'
                  : item.equipment.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>Subwoofer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Amplifier</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span>Speaker</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Power</span>
          </div>
        </div>
      </div>
    </div>
  );
}
