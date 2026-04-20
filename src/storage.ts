import { PomodoroConfig, PomodoroSession, TimerState, TimerMode, DEFAULT_CONFIG } from './types';

interface PersistedTimerState {
  mode: TimerMode;
  secondsLeft: number;
  totalSeconds: number;
  round: number;
  isRunning: boolean;
  savedAt: number;
}

export function loadConfig(key: string): PomodoroConfig {
  try {
    const raw = localStorage.getItem(`${key}:config`);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Partial<PomodoroConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(key: string, config: PomodoroConfig): void {
  try {
    localStorage.setItem(`${key}:config`, JSON.stringify(config));
  } catch {
    // localStorage unavailable (SSR, private browsing quota exceeded)
  }
}

export function loadSessions(key: string): PomodoroSession[] {
  try {
    const raw = localStorage.getItem(`${key}:sessions`);
    if (!raw) return [];
    return JSON.parse(raw) as PomodoroSession[];
  } catch {
    return [];
  }
}

export function saveSession(key: string, session: PomodoroSession): void {
  try {
    const existing = loadSessions(key);
    existing.push(session);
    // Keep last 1000 sessions to bound storage size
    const trimmed = existing.slice(-1000);
    localStorage.setItem(`${key}:sessions`, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable
  }
}

export function loadTimerState(key: string): TimerState | null {
  try {
    const raw = localStorage.getItem(`${key}:timerState`);
    if (!raw) return null;
    const saved = JSON.parse(raw) as PersistedTimerState;

    let secondsLeft = saved.secondsLeft;

    // If it was running when saved, subtract elapsed time so the clock is correct
    if (saved.isRunning) {
      const elapsed = Math.floor((Date.now() - saved.savedAt) / 1000);
      secondsLeft = Math.max(0, saved.secondsLeft - elapsed);
    }

    return {
      mode: saved.mode,
      secondsLeft,
      totalSeconds: saved.totalSeconds,
      round: saved.round,
      isRunning: false, // always restore paused — user resumes deliberately
    };
  } catch {
    return null;
  }
}

export function saveTimerState(key: string, state: TimerState): void {
  try {
    const persisted: PersistedTimerState = { ...state, savedAt: Date.now() };
    localStorage.setItem(`${key}:timerState`, JSON.stringify(persisted));
  } catch {
    // localStorage unavailable
  }
}

function toDateString(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getSessionsForDate(sessions: PomodoroSession[], date: Date): PomodoroSession[] {
  const dateStr = toDateString(date.getTime());
  return sessions.filter((s) => toDateString(s.startedAt) === dateStr);
}

export function getStreak(sessions: PomodoroSession[]): number {
  const completedWork = sessions.filter((s) => s.mode === 'work' && s.completed);
  if (completedWork.length === 0) return 0;

  const daySet = new Set(completedWork.map((s) => toDateString(s.startedAt)));

  let streak = 0;
  const today = new Date();
  let cursor = new Date(today);

  // Allow today OR yesterday as starting point (so streak doesn't break at midnight)
  const todayStr = toDateString(today.getTime());
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toDateString(yesterdayDate.getTime());

  if (!daySet.has(todayStr) && !daySet.has(yesterdayStr)) return 0;

  // Start from today or yesterday depending on which has a session
  if (!daySet.has(todayStr)) {
    cursor = yesterdayDate;
  }

  while (daySet.has(toDateString(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getWeeklyData(sessions: PomodoroSession[]): { date: string; count: number }[] {
  const completedWork = sessions.filter((s) => s.mode === 'work' && s.completed);
  const result: { date: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateStr = toDateString(d.getTime());
    const count = completedWork.filter((s) => toDateString(s.startedAt) === dateStr).length;
    result.push({ date: dateStr, count });
  }

  return result;
}
