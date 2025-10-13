import { Equipment } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface Equipment3DProps {
  equipment: Equipment;
}

export default function Equipment3D({ equipment }: Equipment3DProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const width = 150;
  const height = 150;
  const scale = 3;

  const boxWidth = equipment.size_width * scale;
  const boxHeight = equipment.size_height * scale;
  const boxDepth = equipment.size_depth * scale;

  const centerX = width / 2;
  const centerY = height / 2;

  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const getColor = () => {
    const colorMap: Record<string, { main: string; dark: string; light: string }> = {
      subwoofer: { main: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
      amplifier: { main: '#ef4444', dark: '#dc2626', light: '#f87171' },
      speaker: { main: '#8b5cf6', dark: '#7c3aed', light: '#a78bfa' },
      battery: { main: '#10b981', dark: '#059669', light: '#34d399' },
      alternator: { main: '#3b82f6', dark: '#2563eb', light: '#60a5fa' },
      capacitor: { main: '#ec4899', dark: '#db2777', light: '#f472b6' },
      led_lighting: { main: '#fbbf24', dark: '#f59e0b', light: '#fcd34d' },
      head_unit: { main: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
      sound_deadening: { main: '#6b7280', dark: '#4b5563', light: '#9ca3af' },
    };

    return colorMap[equipment.category_id] || { main: '#06b6d4', dark: '#0891b2', light: '#22d3ee' };
  };

  const colors = getColor();

  const project3D = (x: number, y: number, z: number) => {
    const rotatedX = x * cos - z * sin;
    const rotatedZ = x * sin + z * cos;

    return {
      x: centerX + rotatedX,
      y: centerY + y - rotatedZ * 0.5,
      z: rotatedZ,
    };
  };

  const vertices = [
    { x: -boxWidth / 2, y: -boxHeight / 2, z: -boxDepth / 2 },
    { x: boxWidth / 2, y: -boxHeight / 2, z: -boxDepth / 2 },
    { x: boxWidth / 2, y: boxHeight / 2, z: -boxDepth / 2 },
    { x: -boxWidth / 2, y: boxHeight / 2, z: -boxDepth / 2 },
    { x: -boxWidth / 2, y: -boxHeight / 2, z: boxDepth / 2 },
    { x: boxWidth / 2, y: -boxHeight / 2, z: boxDepth / 2 },
    { x: boxWidth / 2, y: boxHeight / 2, z: boxDepth / 2 },
    { x: -boxWidth / 2, y: boxHeight / 2, z: boxDepth / 2 },
  ];

  const projected = vertices.map(v => project3D(v.x, v.y, v.z));

  const faces = [
    { indices: [0, 1, 2, 3], color: colors.main },
    { indices: [4, 5, 6, 7], color: colors.light },
    { indices: [0, 1, 5, 4], color: colors.dark },
    { indices: [2, 3, 7, 6], color: colors.main },
    { indices: [0, 3, 7, 4], color: colors.dark },
    { indices: [1, 2, 6, 5], color: colors.light },
  ];

  const sortedFaces = faces
    .map((face, idx) => {
      const avgZ = face.indices.reduce((sum, i) => sum + projected[i].z, 0) / face.indices.length;
      return { ...face, avgZ, idx };
    })
    .sort((a, b) => a.avgZ - b.avgZ);

  return (
    <svg width={width} height={height} className="w-full h-full">
      <defs>
        <filter id="equipment-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
        </filter>

        <radialGradient id="equipmentGlow">
          <stop offset="0%" stopColor={colors.light} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.main} stopOpacity="1" />
        </radialGradient>
      </defs>

      {sortedFaces.map((face, idx) => {
        const points = face.indices
          .map(i => `${projected[i].x},${projected[i].y}`)
          .join(' ');

        return (
          <polygon
            key={idx}
            points={points}
            fill={face.avgZ > 0 ? colors.light : colors.dark}
            stroke={colors.main}
            strokeWidth="1.5"
            opacity="0.9"
            filter="url(#equipment-shadow)"
          />
        );
      })}

      {projected.slice(0, 4).map((p, i) => {
        const next = projected[(i + 1) % 4];
        return (
          <line
            key={`edge-front-${i}`}
            x1={p.x}
            y1={p.y}
            x2={next.x}
            y2={next.y}
            stroke={colors.main}
            strokeWidth="2"
          />
        );
      })}

      {projected.slice(4, 8).map((p, i) => {
        const next = projected[4 + ((i + 1) % 4)];
        return (
          <line
            key={`edge-back-${i}`}
            x1={p.x}
            y1={p.y}
            x2={next.x}
            y2={next.y}
            stroke={colors.light}
            strokeWidth="2"
          />
        );
      })}

      {[0, 1, 2, 3].map(i => (
        <line
          key={`edge-connect-${i}`}
          x1={projected[i].x}
          y1={projected[i].y}
          x2={projected[i + 4].x}
          y2={projected[i + 4].y}
          stroke={colors.main}
          strokeWidth="1.5"
        />
      ))}

      <circle
        cx={centerX}
        cy={centerY}
        r="3"
        fill={colors.light}
        filter="url(#equipment-shadow)"
      />
    </svg>
  );
}
