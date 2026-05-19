import React, { useEffect, useState } from 'react';

interface RadarChartProps {
  data: {
    label: string;
    value: number; // 0 to 100
  }[];
}

export default function RadarChart({ data }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 40;
  
  const [animationScale, setAnimationScale] = useState(0);

  // Upgrade 8: Morph polygon from center point outward on mount over 800ms
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 800; // 800ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic transition
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimationScale(ease);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Stagger to match the premium reveal sequence
    const revealTimeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 1100);

    return () => clearTimeout(revealTimeout);
  }, []);
  
  // Calculate points for the polygon
  const getPoint = (value: number, index: number, total: number, scaleOverride?: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const scale = scaleOverride !== undefined ? scaleOverride : animationScale;
    const distance = (value / 100) * radius * scale;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance
    };
  };

  const points = data.map((d, i) => getPoint(d.value, i, data.length));
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid levels (20, 40, 60, 80, 100)
  const levels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="relative w-full aspect-square flex items-center justify-center max-w-[300px] mx-auto select-none">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        
        {/* Draw outer dashed reference polygon and inner level lines */}
        {levels.map((level, i) => {
          const gridPoints = data.map((_, index) => getPoint(level * 100, index, data.length, 1));
          const gridPointsStr = gridPoints.map(p => `${p.x},${p.y}`).join(' ');
          const isOuter = i === levels.length - 1;
          return (
            <polygon 
              key={i}
              points={gridPointsStr}
              fill="none"
              stroke="currentColor"
              className={isOuter ? "text-indigo-500/25" : "text-slate-800/40 dark:text-slate-700/40"}
              strokeDasharray={isOuter ? "4 4" : undefined}
              strokeWidth={isOuter ? "1.5" : "1"}
            />
          );
        })}

        {/* Draw axes connecting center to corners */}
        {data.map((_, i) => {
          const endPoint = getPoint(100, i, data.length, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="currentColor"
              className="text-slate-800/40 dark:text-slate-700/40"
              strokeWidth="1"
            />
          );
        })}

        {/* Draw score polygon */}
        {animationScale > 0.01 && (
          <polygon
            points={pointsString}
            fill="rgba(99, 102, 241, 0.25)"
            stroke="#6366f1"
            strokeWidth="2.5"
            className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          />
        )}

        {/* Draw data point dots on each axis vertex */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="transition-all duration-300 drop-shadow shadow-indigo-500/40"
          />
        ))}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const labelPoint = getPoint(125, i, data.length, 1); // Push labels further out
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="currentColor"
              className="text-[9px] font-bold tracking-tight text-slate-400 uppercase font-sans"
            >
              {d.label}
            </text>
          );
        })}

      </svg>
    </div>
  );
}
