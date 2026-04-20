import { useReducer, useEffect, useRef, useCallback, useMemo, useState } from 'react';
import {
  TimerMode,
  TimerState,
  PomodoroConfig,
  PomodoroSession,
  PomodoroTimerProps,
} from '../types';
import {
  loadConfig,
  saveConfig,
  loadSessions,
  saveSession,
  loadTimerState,
  saveTimerState,
  getSessionsForDate,
  getStreak,
  getWeeklyData,
} from '../storage';
import { playBell } from '../audio';

// ── Reducer ──────────────────────────────────────────────────────────────────

type TimerAction =
  | { type: 'TICK' }
  | { type: 'TOGGLE' }
  | { type: 'RESET'; totalSeconds: number }
  | { type: 'NEXT_MODE'; mode: TimerMode; totalSeconds: number; round: number }
  | { type: 'SET_MODE'; mode: TimerMode; totalSeconds: number }
  | { type: 'RESTORE'; snapshot: TimerState };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'TICK':
      if (!state.isRunning || state.secondsLeft <= 0) return state;
      return { ...state, secondsLeft: state.secondsLeft - 1 };

    case 'TOGGLE':
      return { ...state, isRunning: !state.isRunning };

    case 'RESET':
      return {
        ...state,
        secondsLeft: action.totalSeconds,
        totalSeconds: action.totalSeconds,
        isRunning: false,
      };

    case 'NEXT_MODE':
      return {
        mode: action.mode,
        secondsLeft: action.totalSeconds,
        totalSeconds: action.totalSeconds,
        isRunning: false,
        round: action.round,
      };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        secondsLeft: action.totalSeconds,
        totalSeconds: action.totalSeconds,
        isRunning: false,
      };

    case 'RESTORE':
      return { ...action.snapshot };

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

type UsePomodoroOptions = Pick<PomodoroTimerProps, 'storageKey' | 'onSessionComplete'>;

export function usePomodoro({ storageKey = 'dingerpomo', onSessionComplete }: UsePomodoroOptions = {}) {
  const [config, setConfig] = useConfigState(storageKey);
  const [sessions, setSessions] = useSessionsState(storageKey);

  const [state, dispatch] = useReducer(timerReducer, undefined, () => {
    const saved = loadTimerState(storageKey);
    if (saved) return saved;
    return {
      mode: 'work' as TimerMode,
      secondsLeft: config.workDuration,
      totalSeconds: config.workDuration,
      isRunning: false,
      round: 1,
    };
  });

  // Track session start time
  const sessionStartRef = useRef<number>(Date.now());

  // Undo skip — snapshot valid for 8 seconds
  const [canUndo, setCanUndo] = useState(false);
  const undoSnapshotRef = useRef<TimerState | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep config ref for use inside callbacks without stale closure
  const configRef = useRef(config);
  configRef.current = config;

  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Persist timer state on every change ──
  useEffect(() => {
    saveTimerState(storageKey, state);
  }, [state, storageKey]);

  // ── Tick effect ──
  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  // ── Session completion effect ──
  useEffect(() => {
    if (state.secondsLeft !== 0) return;

    const cfg = configRef.current;
    const current = stateRef.current;

    // Build and save completed session
    const session: PomodoroSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      startedAt: sessionStartRef.current,
      endedAt: Date.now(),
      mode: current.mode,
      durationSeconds: current.totalSeconds,
      completed: true,
    };

    saveSession(storageKey, session);
    setSessions((prev) => [...prev, session]);

    if (cfg.soundEnabled) {
      playBell(cfg.volume);
    }

    onSessionComplete?.(session);

    // Determine next mode
    let nextMode: TimerMode;
    let nextRound = current.round;

    if (current.mode === 'work') {
      if (current.round >= cfg.longBreakInterval) {
        nextMode = 'long-break';
        nextRound = 1;
      } else {
        nextMode = 'short-break';
        nextRound = current.round + 1;
      }
    } else {
      nextMode = 'work';
    }

    const nextDuration =
      nextMode === 'work'
        ? cfg.workDuration
        : nextMode === 'short-break'
        ? cfg.shortBreakDuration
        : cfg.longBreakDuration;

    const shouldAutoStart =
      (nextMode !== 'work' && cfg.autoStartBreaks) ||
      (nextMode === 'work' && cfg.autoStartWork);

    dispatch({ type: 'NEXT_MODE', mode: nextMode, totalSeconds: nextDuration, round: nextRound });

    sessionStartRef.current = Date.now();

    if (shouldAutoStart) {
      // Give the reducer a tick to settle before starting
      setTimeout(() => dispatch({ type: 'TOGGLE' }), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.secondsLeft === 0 ? state.secondsLeft : null]);

  // ── Public actions ──

  const toggle = useCallback(() => {
    if (!stateRef.current.isRunning) {
      sessionStartRef.current = Date.now();
    }
    dispatch({ type: 'TOGGLE' });
  }, []);

  const reset = useCallback(() => {
    const cfg = configRef.current;
    const cur = stateRef.current;
    const duration =
      cur.mode === 'work'
        ? cfg.workDuration
        : cur.mode === 'short-break'
        ? cfg.shortBreakDuration
        : cfg.longBreakDuration;
    dispatch({ type: 'RESET', totalSeconds: duration });
    sessionStartRef.current = Date.now();
  }, []);

  const skip = useCallback(() => {
    const cfg = configRef.current;
    const cur = stateRef.current;

    // Snapshot current state for undo
    undoSnapshotRef.current = { ...cur };
    setCanUndo(true);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      setCanUndo(false);
      undoSnapshotRef.current = null;
    }, 8000);

    let nextMode: TimerMode;
    let nextRound = cur.round;

    if (cur.mode === 'work') {
      if (cur.round >= cfg.longBreakInterval) {
        nextMode = 'long-break';
        nextRound = 1;
      } else {
        nextMode = 'short-break';
        nextRound = cur.round + 1;
      }
    } else {
      nextMode = 'work';
    }

    const nextDuration =
      nextMode === 'work'
        ? cfg.workDuration
        : nextMode === 'short-break'
        ? cfg.shortBreakDuration
        : cfg.longBreakDuration;

    dispatch({ type: 'NEXT_MODE', mode: nextMode, totalSeconds: nextDuration, round: nextRound });
    sessionStartRef.current = Date.now();
  }, []);

  const undoSkip = useCallback(() => {
    if (!undoSnapshotRef.current) return;
    dispatch({ type: 'RESTORE', snapshot: undoSnapshotRef.current });
    undoSnapshotRef.current = null;
    setCanUndo(false);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    sessionStartRef.current = Date.now();
  }, []);

  const updateConfig = useCallback(
    (partial: Partial<PomodoroConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial };
        saveConfig(storageKey, next);

        // If duration changed for current mode, update timer
        const cur = stateRef.current;
        if (!cur.isRunning) {
          const newDuration =
            cur.mode === 'work'
              ? next.workDuration
              : cur.mode === 'short-break'
              ? next.shortBreakDuration
              : next.longBreakDuration;
          if (newDuration !== cur.totalSeconds) {
            dispatch({ type: 'SET_MODE', mode: cur.mode, totalSeconds: newDuration });
          }
        }

        return next;
      });
    },
    [storageKey]
  );

  // ── Derived stats ──

  const todayStats = useMemo(() => {
    const todaySessions = getSessionsForDate(sessions, new Date());
    const completed = todaySessions.filter((s) => s.mode === 'work' && s.completed).length;
    const focusMinutes = Math.round(
      todaySessions
        .filter((s) => s.mode === 'work' && s.completed)
        .reduce((acc, s) => acc + s.durationSeconds, 0) / 60
    );
    return { completed, focusMinutes };
  }, [sessions]);

  const weeklyData = useMemo(() => getWeeklyData(sessions), [sessions]);
  const streak = useMemo(() => getStreak(sessions), [sessions]);

  return {
    state,
    config,
    sessions,
    toggle,
    reset,
    skip,
    undoSkip,
    canUndo,
    updateConfig,
    todayStats,
    weeklyData,
    streak,
  };
}

// ── Local state helpers ───────────────────────────────────────────────────────

function useConfigState(storageKey: string) {
  const [config, setConfig] = useReducer(
    (_prev: PomodoroConfig, next: PomodoroConfig | ((p: PomodoroConfig) => PomodoroConfig)) =>
      typeof next === 'function' ? next(_prev) : next,
    undefined,
    () => loadConfig(storageKey)
  );
  return [config, setConfig] as const;
}

function useSessionsState(storageKey: string) {
  const [sessions, setSessions] = useReducer(
    (
      _prev: PomodoroSession[],
      next: PomodoroSession[] | ((p: PomodoroSession[]) => PomodoroSession[])
    ) => (typeof next === 'function' ? next(_prev) : next),
    undefined,
    () => loadSessions(storageKey)
  );
  return [sessions, setSessions] as const;
}
