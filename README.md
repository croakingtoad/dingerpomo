# dingerpomo

A Pomodoro timer React component with session history, stats, and a floating widget — named for the railroad yardmaster who rings the bell.

## Install

```bash
npm install dingerpomo
```

Import the CSS in your app entry point:

```tsx
import 'dingerpomo/styles';
```

## Usage

### Floating widget (default)

Drop it in your app root and forget about it. It renders as a fixed overlay in the bottom-right corner.

```tsx
import { PomodoroTimer } from 'dingerpomo';
import 'dingerpomo/styles';

export default function App() {
  return (
    <>
      <YourApp />
      <PomodoroTimer />
    </>
  );
}
```

### Inline / embedded

```tsx
<PomodoroTimer floating={false} />
```

### Hook-only (bring your own UI)

```tsx
import { usePomodoro } from 'dingerpomo';

function MyTimer() {
  const { state, toggle, reset, skip, todayStats, streak } = usePomodoro();

  return (
    <div>
      <p>{state.secondsLeft}s left — {state.mode}</p>
      <button onClick={toggle}>{state.isRunning ? 'Pause' : 'Start'}</button>
      <p>Today: {todayStats.completed} pomodoros</p>
      <p>Streak: {streak} days</p>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `floating` | `boolean` | `true` | Fixed position overlay (bottom-right) vs inline |
| `storageKey` | `string` | `'dingerpomo'` | localStorage key prefix |
| `onSessionComplete` | `(session: PomodoroSession) => void` | — | Callback on session end |

## Theming

Override CSS custom properties to theme the widget:

```css
:root {
  --dinger-bg: #0f172a;
  --dinger-surface: #1e293b;
  --dinger-border: #334155;
  --dinger-text: #f1f5f9;
  --dinger-text-muted: #94a3b8;
  --dinger-work: #f97316;
  --dinger-short-break: #10b981;
  --dinger-long-break: #6366f1;
  --dinger-radius: 16px;
}
```

## Types

```typescript
import type { PomodoroConfig, PomodoroSession, TimerMode, TimerState } from 'dingerpomo';
```

## License

MIT
