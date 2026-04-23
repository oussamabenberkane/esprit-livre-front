let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * 600ms soft C-major harp arpeggio: C5 → E5 → G5 → C6, staggered 50ms apart.
 * Triangle waves give a warm pluck character without harshness.
 * Tuned for a premium book platform — musical, not gamey.
 */
export function playCartSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.6;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.15, now);
    master.connect(ctx.destination);

    const notes = [
      { freq: 523.25,  offset: 0.00, peak: 0.70, type: 'triangle' }, // C5
      { freq: 659.25,  offset: 0.05, peak: 0.55, type: 'triangle' }, // E5
      { freq: 783.99,  offset: 0.10, peak: 0.45, type: 'triangle' }, // G5
      { freq: 1046.50, offset: 0.15, peak: 0.18, type: 'sine'     }, // C6 — quiet overtone
    ];

    notes.forEach(({ freq, offset, peak, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + offset);

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(peak, now + offset + 0.012); // 12ms attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(master);
      osc.start(now + offset);
      osc.stop(now + duration + 0.02);
    });
  } catch {
    // Audio not available — silently skip
  }
}
