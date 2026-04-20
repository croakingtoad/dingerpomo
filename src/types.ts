export type TimerMode = 'work' | 'short-break' | 'long-break';

export interface PomodoroConfig {
  workDuration: number;        // seconds, default 25*60
  shortBreakDuration: number;  // seconds, default 5*60
  longBreakDuration: number;   // seconds, default 15*60
  longBreakInterval: number;   // default 4
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  volume: number;              // 0-1
}

export const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  volume: 0.5,
};

export interface PomodoroSession {
  id: string;
  startedAt: number;   // unix ms
  endedAt: number;
  mode: TimerMode;
  durationSeconds: number;
  completed: boolean;
}

export interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  round: number;  // 1-based, resets after long break
}

export interface PomodoroTimerProps {
  floating?: boolean;       // default true — fixed position overlay
  storageKey?: string;      // default 'dingerpomo'
  onSessionComplete?: (session: PomodoroSession) => void;
}
