import React from 'react';

interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

function ResetIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 8a6 6 0 1 1 1.5 3.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <polyline
        points="2,5 2,8 5,8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <polygon
        points="5,2 16,9 5,16"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="11" y="2" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

function SkipIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <polygon points="2,2 11,8 2,14" fill="currentColor" />
      <rect x="12" y="2" width="2" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function UndoIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 7a5 5 0 1 1 .9 2.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <polyline
        points="3,4 3,7 6,7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Controls({ isRunning, onToggle, onReset, onSkip, onUndo, canUndo }: ControlsProps): React.ReactElement {
  return (
    <div className="dinger-controls" role="group" aria-label="Timer controls">
      <button
        className="dinger-btn dinger-btn-secondary"
        onClick={onReset}
        aria-label="Reset timer"
        title="Reset"
      >
        <ResetIcon />
      </button>
      <button
        className="dinger-btn dinger-btn-primary"
        onClick={onToggle}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button
        className="dinger-btn dinger-btn-secondary"
        onClick={canUndo ? onUndo : onSkip}
        aria-label={canUndo ? 'Undo skip' : 'Skip to next session'}
        title={canUndo ? 'Undo skip (8s)' : 'Skip'}
        style={canUndo ? { color: 'var(--dinger-work)', opacity: 1 } : undefined}
      >
        {canUndo ? <UndoIcon /> : <SkipIcon />}
      </button>
    </div>
  );
}
