import React, { useState } from 'react';
import { PomodoroTimerProps, TimerMode } from '../../types';
import { usePomodoro } from '../../hooks/usePomodoro';
import { Dial } from './Dial';
import { Controls } from './Controls';
import { Stats } from './Stats';
import { Settings } from './Settings';

type ActiveTab = 'stats' | 'settings';

const MODE_LABEL: Record<TimerMode, string> = {
  work: 'FOCUS',
  'short-break': 'SHORT BREAK',
  'long-break': 'LONG BREAK',
};

function CloseIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PomodoroTimer({
  floating = true,
  storageKey = 'dingerpomo',
  onSessionComplete,
}: PomodoroTimerProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stats');

  const {
    state,
    config,
    toggle,
    reset,
    skip,
    updateConfig,
    todayStats,
    weeklyData,
    streak,
  } = usePomodoro({ storageKey, onSessionComplete });

  const floatingStyle: React.CSSProperties = floating
    ? { position: 'fixed', top: 24, right: 24, zIndex: 9999, width: 'fit-content' }
    : { position: 'relative', display: 'inline-block' };

  const wrapperClass = [
    'dinger-widget',
    expanded ? 'dinger-expanded' : 'dinger-collapsed',
  ]
    .filter(Boolean)
    .join(' ');

  if (!expanded) {
    return (
      <div
        className={wrapperClass}
        style={floatingStyle}
        onClick={() => setExpanded(true)}
        role="button"
        tabIndex={0}
        aria-label="Open Pomodoro timer"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(true);
          }
        }}
      >
        <Dial
          secondsLeft={state.secondsLeft}
          totalSeconds={state.totalSeconds}
          mode={state.mode}
        />
        {state.isRunning && (
          <span className="dinger-running-dot" aria-label="Timer running" />
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={floatingStyle} role="dialog" aria-label="Pomodoro timer">
      {/* Header row */}
      <div className="dinger-header">
        <div className="dinger-mode-info">
          <span className="dinger-mode-label">{MODE_LABEL[state.mode]}</span>
          <span className="dinger-round-badge" aria-label={`Round ${state.round} of ${config.longBreakInterval}`}>
            {state.mode === 'work' ? `${state.round} / ${config.longBreakInterval}` : ''}
          </span>
        </div>
        <button
          className="dinger-btn dinger-btn-close"
          onClick={() => setExpanded(false)}
          aria-label="Collapse timer"
          title="Close"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Dial */}
      <div className="dinger-dial-wrapper">
        <Dial
          secondsLeft={state.secondsLeft}
          totalSeconds={state.totalSeconds}
          mode={state.mode}
        />
      </div>

      {/* Controls */}
      <Controls
        isRunning={state.isRunning}
        onToggle={toggle}
        onReset={reset}
        onSkip={skip}
      />

      {/* Tab bar */}
      <div className="dinger-tabs" role="tablist">
        <button
          className={`dinger-tab ${activeTab === 'stats' ? 'dinger-tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button
          className={`dinger-tab ${activeTab === 'settings' ? 'dinger-tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Tab content */}
      <div className="dinger-tab-panel" role="tabpanel">
        {activeTab === 'stats' ? (
          <Stats
            todayCompleted={todayStats.completed}
            focusMinutes={todayStats.focusMinutes}
            streak={streak}
            weeklyData={weeklyData}
            mode={state.mode}
          />
        ) : (
          <Settings config={config} updateConfig={updateConfig} />
        )}
      </div>
    </div>
  );
}
