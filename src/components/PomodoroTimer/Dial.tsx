import React from 'react';
import { TimerMode } from '../../types';

const SIZE = 120;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MODE_COLOR_VAR: Record<TimerMode, string> = {
  work: 'var(--dinger-work, #ef4444)',
  'short-break': 'var(--dinger-short-break, #22c55e)',
  'long-break': 'var(--dinger-long-break, #3b82f6)',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface DialProps {
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
}

export function Dial({ secondsLeft, totalSeconds, mode }: DialProps): React.ReactElement {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const modeColor = MODE_COLOR_VAR[mode];

  return (
    <svg
      className="dinger-dial"
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-label={`Timer: ${formatTime(secondsLeft)} remaining`}
    >
      {/* Track ring */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--dinger-border, #3f3f46)"
        strokeWidth={STROKE}
      />
      {/* Progress ring */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={modeColor}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      {/* Time label */}
      <text
        x={SIZE / 2}
        y={SIZE / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        fill="var(--dinger-text, #f4f4f5)"
        fontSize="18"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontWeight="600"
      >
        {formatTime(secondsLeft)}
      </text>
    </svg>
  );
}
