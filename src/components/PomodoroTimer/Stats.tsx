import React from 'react';
import { TimerMode } from '../../types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getHeatLevel(count: number): string {
  if (count === 0) return 'dinger-heat-0';
  if (count <= 2) return 'dinger-heat-1';
  if (count <= 4) return 'dinger-heat-2';
  return 'dinger-heat-3';
}

function getModeColorVar(mode: TimerMode): string {
  if (mode === 'work') return 'var(--dinger-work, #ef4444)';
  if (mode === 'short-break') return 'var(--dinger-short-break, #22c55e)';
  return 'var(--dinger-long-break, #3b82f6)';
}

interface StatsProps {
  todayCompleted: number;
  focusMinutes: number;
  streak: number;
  weeklyData: { date: string; count: number }[];
  mode: TimerMode;
}

export function Stats({ todayCompleted, focusMinutes, streak, weeklyData, mode }: StatsProps): React.ReactElement {
  const modeColor = getModeColorVar(mode);

  return (
    <div className="dinger-stats">
      <div className="dinger-stats-today">
        <span className="dinger-stats-value">{todayCompleted}</span>
        <span className="dinger-stats-label">
          {todayCompleted === 1 ? 'pomodoro' : 'pomodoros'}
        </span>
        <span className="dinger-stats-dot" aria-hidden="true">·</span>
        <span className="dinger-stats-value">{focusMinutes}</span>
        <span className="dinger-stats-label">min focus</span>
      </div>

      {streak > 0 && (
        <div className="dinger-streak" aria-label={`${streak} day streak`}>
          <span aria-hidden="true">🔥</span>
          <span>{streak} day{streak !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="dinger-heatmap" aria-label="Weekly activity" role="img">
        {weeklyData.map((day, i) => (
          <div key={day.date} className="dinger-heat-col">
            <div
              className={`dinger-heat-dot ${getHeatLevel(day.count)}`}
              style={
                day.count > 0
                  ? { backgroundColor: modeColor, opacity: 0.3 + getHeatOpacity(day.count) }
                  : undefined
              }
              title={`${day.date}: ${day.count} pomodoro${day.count !== 1 ? 's' : ''}`}
            />
            <span className="dinger-heat-label" aria-hidden="true">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getHeatOpacity(count: number): number {
  if (count <= 2) return 0.4;
  if (count <= 4) return 0.6;
  return 0.9;
}
