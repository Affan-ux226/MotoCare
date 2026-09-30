/**
 * MotoCare Microinteraction Feedback Engine
 * Handles lightweight haptic vibration (navigator.vibrate) and synthesized Web Audio sound effects.
 * Requires 0 external audio files/assets. Low volume, non-intrusive, optimized for mobile & desktop.
 */

const STORAGE_KEYS = {
  HAPTICS: 'motocare_haptics_enabled',
  SOUND: 'motocare_sound_enabled',
};

// Singleton AudioContext with lazy initialization on first user interaction
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch (e) {
        // AudioContext initialization blocked or not supported
        return null;
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(STORAGE_KEYS.HAPTICS);
  return saved !== null ? saved === 'true' : true;
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HAPTICS, enabled ? 'true' : 'false');
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
  return saved !== null ? saved === 'true' : true;
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SOUND, enabled ? 'true' : 'false');
}

/**
 * Trigger subtle haptic vibration on devices supporting it
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' | 'heavy' = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  if (!isHapticsEnabled()) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(28);
        break;
      case 'success':
        navigator.vibrate([15, 40, 25]);
        break;
      case 'warning':
        navigator.vibrate([35, 30, 45]);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
    }
  } catch (e) {
    // Vibration error or unsupported
  }
}

/**
 * Synthesizes short, delicate sound cues using Web Audio API
 */
export function playSound(type: 'tap' | 'click' | 'success' | 'toggle' | 'odometer' | 'alert' = 'tap'): void {
  if (typeof window === 'undefined') return;
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'tap' || type === 'click') {
      // Soft wood/plastic tap click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'click' ? 440 : 360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'toggle') {
      // Crisp toggle sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } else if (type === 'odometer') {
      // Gauge / odometer tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'success') {
      // Pleasant dual harmonic chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.045;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.13);
      });
    } else if (type === 'alert') {
      // Soft gentle warning
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(280, now + 0.06);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    }
  } catch (e) {
    // Ignore audio playback errors
  }
}

/**
 * Combined Microinteraction Feedback (Tactile + Auditory)
 */
export function feedback(type: 'tap' | 'click' | 'success' | 'toggle' | 'odometer' | 'alert' = 'tap'): void {
  if (type === 'success') {
    triggerHaptic('success');
    playSound('success');
  } else if (type === 'alert') {
    triggerHaptic('warning');
    playSound('alert');
  } else if (type === 'toggle') {
    triggerHaptic('light');
    playSound('toggle');
  } else if (type === 'odometer') {
    triggerHaptic('light');
    playSound('odometer');
  } else if (type === 'click') {
    triggerHaptic('medium');
    playSound('click');
  } else {
    triggerHaptic('light');
    playSound('tap');
  }
}
