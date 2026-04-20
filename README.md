# dingerpomo

A Pomodoro timer React component with session history, stats, and a floating widget UI. Zero runtime dependencies beyond React.

**Named for the railroad yardmaster** — the *dinger* is the person who rings the bell to signal crew movements. Here, the bell signals your focus sessions.

---

## Features

- **Floating widget** — drop one line in your app, get a persistent timer in the corner
- **Bring your own UI** — the `usePomodoro` hook exposes all state and actions if you want to build your own interface
- **Session history** — every completed session is saved to `localStorage`; stats survive page refreshes and browser restarts
- **Daily & weekly stats** — pomodoros completed today, focus minutes, day streak, 7-day heatmap
- **Undo skip** — accidentally hit skip? An 8-second undo window brings you back
- **Configurable** — work/break durations, long-break interval, auto-start toggles, sound and volume
- **Themeable** — CSS custom properties control every color; override to match your app's palette
- **No dependencies** — just React as a peer dep; no icon libraries, no animation frameworks, no date utilities

---

## Install

```bash
npm install dingerpomo
# or
yarn add dingerpomo
# or
pnpm add dingerpomo
```

Import the stylesheet once in your app entry point, **before** your own CSS so your theme overrides take effect:

```tsx
// main.tsx / index.tsx
import 'dingerpomo/styles';
import './index.css';   // your overrides go here
```

---

## Quick start

```tsx
import { PomodoroTimer } from 'dingerpomo';

export default function App() {
  return (
    <>
      <YourApp />
      <PomodoroTimer />  {/* that's it */}
    </>
  );
}
```

The widget renders as a small circular dial fixed to the top-right corner. Click it to expand the full panel with controls, stats, and settings.

---

## Usage

### Floating widget (default)

```tsx
import { PomodoroTimer } from 'dingerpomo';
import 'dingerpomo/styles';

<PomodoroTimer />
```

**Collapsed:** a circular progress ring showing remaining time. A pulsing dot appears while running.

**Expanded:** full dial + mode label + round counter + play/pause/reset/skip controls + Stats and Settings tabs.

### Inline / embedded

```tsx
<PomodoroTimer floating={false} />
```

Renders in normal document flow — useful for a sidebar or dashboard card.

### Custom storage key

If you're running multiple independent timers or want to namespace the storage:

```tsx
<PomodoroTimer storageKey="my-app-pomodoro" />
```

### Session complete callback

```tsx
<PomodoroTimer
  onSessionComplete={(session) => {
    console.log('Completed:', session.mode, session.durationSeconds / 60, 'min');
  }}
/>
```

### Hook only — bring your own UI

If you want the logic without the built-in widget:

```tsx
import { usePomodoro } from 'dingerpomo';

function MyTimer() {
  const {
    state,
    config,
    toggle,
    reset,
    skip,
    undoSkip,
    canUndo,
    updateConfig,
    todayStats,
    weeklyData,
    streak,
  } = usePomodoro({ storageKey: 'my-timer' });

  const mins = Math.floor(state.secondsLeft / 60).toString().padStart(2, '0');
  const secs = (state.secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div>
      <p>{state.mode} — {mins}:{secs}</p>
      <p>Round {state.round} of {config.longBreakInterval}</p>
      <button onClick={toggle}>{state.isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
      <button onClick={canUndo ? undoSkip : skip}>
        {canUndo ? 'Undo skip' : 'Skip'}
      </button>
      <p>Today: {todayStats.completed} pomodoros · {todayStats.focusMinutes} min</p>
      <p>Streak: {streak} days</p>
    </div>
  );
}
```

---

## API

### `<PomodoroTimer>` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `floating` | `boolean` | `true` | `true` = fixed overlay (top-right); `false` = inline |
| `storageKey` | `string` | `'dingerpomo'` | `localStorage` key prefix for state, config, and sessions |
| `onSessionComplete` | `(session: PomodoroSession) => void` | — | Fired whenever a session ends (completed or skipped via timer expiry) |

### `usePomodoro(options?)` hook

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storageKey` | `string` | `'dingerpomo'` | localStorage key prefix |
| `onSessionComplete` | `(session: PomodoroSession) => void` | — | Session complete callback |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `state` | `TimerState` | Current timer state (see below) |
| `config` | `PomodoroConfig` | Current configuration |
| `sessions` | `PomodoroSession[]` | All saved sessions from localStorage |
| `toggle()` | `() => void` | Start or pause the timer |
| `reset()` | `() => void` | Restart the current mode from full duration |
| `skip()` | `() => void` | Advance to the next mode |
| `undoSkip()` | `() => void` | Revert the last skip (valid for 8 seconds) |
| `canUndo` | `boolean` | Whether an undo is currently available |
| `updateConfig(partial)` | `(partial: Partial<PomodoroConfig>) => void` | Update one or more config values |
| `todayStats` | `{ completed: number; focusMinutes: number }` | Today's focus totals |
| `weeklyData` | `{ date: string; count: number }[]` | Last 7 days of completed work sessions |
| `streak` | `number` | Consecutive days with at least one completed pomodoro |

### `TimerState`

```typescript
interface TimerState {
  mode: 'work' | 'short-break' | 'long-break';
  secondsLeft: number;
  totalSeconds: number;   // full duration for the current mode
  isRunning: boolean;
  round: number;          // current work round (resets after long break)
}
```

### `PomodoroConfig`

```typescript
interface PomodoroConfig {
  workDuration: number;        // seconds (default: 1500 = 25 min)
  shortBreakDuration: number;  // seconds (default: 300 = 5 min)
  longBreakDuration: number;   // seconds (default: 900 = 15 min)
  longBreakInterval: number;   // work rounds before long break (default: 4)
  autoStartBreaks: boolean;    // auto-start break when work ends (default: false)
  autoStartWork: boolean;      // auto-start work when break ends (default: false)
  soundEnabled: boolean;       // play bell on session end (default: true)
  volume: number;              // 0–1 (default: 0.5)
}
```

### `PomodoroSession`

```typescript
interface PomodoroSession {
  id: string;
  startedAt: number;       // unix ms
  endedAt: number;         // unix ms
  mode: 'work' | 'short-break' | 'long-break';
  durationSeconds: number;
  completed: boolean;
}
```

---

## Persistence

All state is stored in `localStorage` under your `storageKey` prefix:

| Key | Contents |
|-----|----------|
| `{key}:timerState` | Current mode, time remaining, round — restored on page load |
| `{key}:config` | User's configuration settings |
| `{key}:sessions` | Array of completed sessions (capped at 1000) |

**On refresh:** timer state restores exactly as left. If the timer was running when the page closed, dingerpomo calculates elapsed time and adjusts the remaining seconds — so you never come back to a stale countdown. The timer always restores as *paused*; you resume deliberately.

---

## Theming

Override CSS custom properties to match your app's design. Import dingerpomo's stylesheet first, then override in your own CSS:

```css
/* your app's CSS */
:root {
  --dinger-bg: #0f172a;           /* widget background */
  --dinger-surface: #1e293b;      /* raised elements, buttons */
  --dinger-border: #334155;       /* borders, dividers */
  --dinger-text: #f1f5f9;         /* primary text */
  --dinger-text-muted: #64748b;   /* secondary text, labels */
  --dinger-work: #f97316;         /* focus session ring color */
  --dinger-short-break: #10b981;  /* short break ring color */
  --dinger-long-break: #6366f1;   /* long break ring color */
  --dinger-radius: 12px;          /* border radius */
  --dinger-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

All class names are prefixed with `dinger-` so they won't collide with your own styles.

---

## Undo skip

Pressing skip moves immediately to the next mode. For 8 seconds after a skip, the skip button transforms into an undo button — press it to restore the previous mode and time. After 8 seconds it reverts to the normal skip button.

This is exposed on the hook too (`canUndo`, `undoSkip()`) so you can implement the same pattern in a custom UI.

---

## Sound

dingerpomo uses the Web Audio API to generate a two-tone bell (880 Hz → 440 Hz) with an exponential decay — no audio files, no external assets. Sound plays on session completion (not on skip). If the browser requires a user gesture before audio plays, the bell will fire correctly after the user has first interacted with the page.

---

## Browser support

Anything that supports the Web Audio API and `localStorage` — all modern browsers. No SSR support (accesses browser APIs on mount).

---

## License

MIT
