import { motion } from 'motion/react';
import { POINT } from '../lib/theme';
import type { Theme } from '../lib/theme';

interface RingProgressProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  theme: Theme;
}

export default function RingProgress({ current, total, size = 200, strokeWidth = 24, theme }: RingProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(current / total, 1);
  const offset = circumference - percentage * circumference;
  const isDark = theme === 'dark';
  const bgStroke = isDark ? 'rgba(255,255,255,0.05)' : '#E8E8E8';
  const fgStroke = isDark ? '#ffffff' : POINT;
  const glowColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,190,0,0.3)';
  const textColor = isDark ? '#ffffff' : '#111111';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke={bgStroke} strokeWidth={strokeWidth} />
      </svg>
      <svg className="absolute -rotate-90" width={size} height={size}>
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="transparent"
          stroke={fgStroke} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      <span className="text-5xl font-bold tracking-tighter" style={{ color: textColor }}>{current}</span>
    </div>
  );
}
