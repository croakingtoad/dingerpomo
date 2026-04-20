import React from 'react';
import { PomodoroConfig } from '../../types';

interface SettingsProps {
  config: PomodoroConfig;
  updateConfig: (partial: Partial<PomodoroConfig>) => void;
}

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

function Toggle({ id, checked, onChange, label }: ToggleProps): React.ReactElement {
  return (
    <label className="dinger-setting-row dinger-toggle-row" htmlFor={id}>
      <span className="dinger-setting-label">{label}</span>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        className={`dinger-toggle ${checked ? 'dinger-toggle-on' : ''}`}
        onClick={() => onChange(!checked)}
        aria-label={label}
      >
        <span className="dinger-toggle-thumb" />
      </button>
    </label>
  );
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

function NumberField({ id, label, value, min = 1, max = 120, onChange }: NumberFieldProps): React.ReactElement {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n);
    }
  }

  return (
    <label className="dinger-setting-row" htmlFor={id}>
      <span className="dinger-setting-label">{label}</span>
      <input
        id={id}
        type="number"
        className="dinger-input"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        aria-label={`${label} in minutes`}
      />
    </label>
  );
}

export function Settings({ config, updateConfig }: SettingsProps): React.ReactElement {
  return (
    <div className="dinger-settings">
      <NumberField
        id="dinger-work-duration"
        label="Work"
        value={Math.round(config.workDuration / 60)}
        min={1}
        max={120}
        onChange={(m) => updateConfig({ workDuration: m * 60 })}
      />
      <NumberField
        id="dinger-short-break"
        label="Short break"
        value={Math.round(config.shortBreakDuration / 60)}
        min={1}
        max={60}
        onChange={(m) => updateConfig({ shortBreakDuration: m * 60 })}
      />
      <NumberField
        id="dinger-long-break"
        label="Long break"
        value={Math.round(config.longBreakDuration / 60)}
        min={1}
        max={60}
        onChange={(m) => updateConfig({ longBreakDuration: m * 60 })}
      />
      <NumberField
        id="dinger-long-break-interval"
        label="Long break every"
        value={config.longBreakInterval}
        min={1}
        max={10}
        onChange={(n) => updateConfig({ longBreakInterval: n })}
      />

      <div className="dinger-settings-divider" />

      <Toggle
        id="dinger-auto-breaks"
        checked={config.autoStartBreaks}
        onChange={(v) => updateConfig({ autoStartBreaks: v })}
        label="Auto-start breaks"
      />
      <Toggle
        id="dinger-auto-work"
        checked={config.autoStartWork}
        onChange={(v) => updateConfig({ autoStartWork: v })}
        label="Auto-start work"
      />

      <div className="dinger-settings-divider" />

      <Toggle
        id="dinger-sound"
        checked={config.soundEnabled}
        onChange={(v) => updateConfig({ soundEnabled: v })}
        label="Bell sound"
      />

      {config.soundEnabled && (
        <label className="dinger-setting-row" htmlFor="dinger-volume">
          <span className="dinger-setting-label">Volume</span>
          <input
            id="dinger-volume"
            type="range"
            className="dinger-slider"
            min={0}
            max={1}
            step={0.05}
            value={config.volume}
            onChange={(e) => updateConfig({ volume: parseFloat(e.target.value) })}
            aria-label="Bell volume"
          />
        </label>
      )}
    </div>
  );
}
