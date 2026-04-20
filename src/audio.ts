let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  } catch {
    return null;
  }
}

export function playBell(volume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();

  resume.then(() => {
    const now = ctx.currentTime;

    // Tone 1: 880 Hz (A5) — sharp attack
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 1.5);
    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.5);

    // Tone 2: 660 Hz (E5) — starts 0.3s later, harmonic bell overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(330, now + 1.8);
    gain2.gain.setValueAtTime(volume * 0.6, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 1.8);
  }).catch(() => {
    // AudioContext couldn't resume — silently ignore
  });
}
