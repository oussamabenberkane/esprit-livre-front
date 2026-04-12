let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Plays a satisfying ~2s swoosh when an item is added to cart.
 * Layered: a rising whoosh, a tonal sweep, and a soft sparkle tail.
 */
export function playCartSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 2.0;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.22, now);
    master.connect(ctx.destination);

    // --- Layer 1: Filtered noise swoosh ---
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(300, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
    noiseFilter.frequency.exponentialRampToValueAtTime(600, now + 1.4);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + duration);
    noiseFilter.Q.setValueAtTime(1.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    noiseGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
    noise.stop(now + duration);

    // --- Layer 2: Tonal sweep (gives it a "whooo" feel) ---
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(250, now);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.35);
    sweep.frequency.exponentialRampToValueAtTime(500, now + 0.8);
    sweep.frequency.exponentialRampToValueAtTime(300, now + 1.5);
    sweep.frequency.exponentialRampToValueAtTime(180, now + duration);

    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    sweepGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    sweep.connect(sweepGain);
    sweepGain.connect(master);
    sweep.start(now);
    sweep.stop(now + duration);

    // --- Layer 3: Confirmation chime (at the peak of the swoosh) ---
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, now + 0.25);
    chime.frequency.setValueAtTime(1108, now + 0.45);

    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
    chimeGain.gain.linearRampToValueAtTime(0.1, now + 0.6);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    chime.connect(chimeGain);
    chimeGain.connect(master);
    chime.start(now + 0.25);
    chime.stop(now + 1.4);

    // --- Layer 4: Sparkle tail (soft high shimmer fading out) ---
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(1760, now + 0.5);
    sparkle.frequency.exponentialRampToValueAtTime(1200, now + duration);

    sparkleGain.gain.setValueAtTime(0, now);
    sparkleGain.gain.linearRampToValueAtTime(0.06, now + 0.6);
    sparkleGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    sparkle.connect(sparkleGain);
    sparkleGain.connect(master);
    sparkle.start(now + 0.5);
    sparkle.stop(now + duration);
  } catch {
    // Audio not available — silently skip
  }
}
