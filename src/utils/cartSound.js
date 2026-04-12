let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Plays a 1s "pop-swoosh" — the warmth/punch of the original pop
 * blended with the airy sweep of the swoosh.
 */
export function playCartSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 1.0;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.2, now);
    master.connect(ctx.destination);

    // --- Layer 1: Warm thud (pop punch) ---
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(200, now);
    thud.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    thudGain.gain.setValueAtTime(0.5, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    thud.connect(thudGain);
    thudGain.connect(master);
    thud.start(now);
    thud.stop(now + 0.2);

    // --- Layer 2: Light noise swoosh (air) ---
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
    noiseFilter.frequency.setValueAtTime(400, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
    noiseFilter.frequency.exponentialRampToValueAtTime(400, now + 0.8);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + duration);
    noiseFilter.Q.setValueAtTime(1.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.06);
    noiseGain.gain.linearRampToValueAtTime(0.1, now + 0.2);
    noiseGain.gain.linearRampToValueAtTime(0.03, now + 0.7);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);
    noise.stop(now + duration);

    // --- Layer 3: Chime (confirmation tone, from the pop) ---
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, now + 0.04);
    chime.frequency.setValueAtTime(1108, now + 0.15);
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.06);
    chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    chime.connect(chimeGain);
    chimeGain.connect(master);
    chime.start(now + 0.04);
    chime.stop(now + 0.75);

    // --- Layer 4: Sparkle tail (shimmer fade-out) ---
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(1760, now + 0.15);
    sparkle.frequency.exponentialRampToValueAtTime(1200, now + duration);
    sparkleGain.gain.setValueAtTime(0, now);
    sparkleGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    sparkleGain.gain.linearRampToValueAtTime(0.03, now + 0.6);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    sparkle.connect(sparkleGain);
    sparkleGain.connect(master);
    sparkle.start(now + 0.15);
    sparkle.stop(now + duration);
  } catch {
    // Audio not available — silently skip
  }
}
