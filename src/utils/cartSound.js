let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Plays a warm, satisfying "book placed" chime when an item is added to cart.
 * Two-tone: a soft thud (low) layered with a bright chime (high) —
 * feels like setting a book down on a wooden shelf.
 */
export function playCartSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.18, now);
    master.connect(ctx.destination);

    // --- Layer 1: Soft thud (warmth) ---
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(220, now);
    thud.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    thudGain.gain.setValueAtTime(0.5, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    thud.connect(thudGain);
    thudGain.connect(master);
    thud.start(now);
    thud.stop(now + 0.15);

    // --- Layer 2: Bright chime (confirmation) ---
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, now + 0.03);
    chime.frequency.setValueAtTime(1108, now + 0.09); // Major third up
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    chime.connect(chimeGain);
    chimeGain.connect(master);
    chime.start(now + 0.03);
    chime.stop(now + 0.3);

    // --- Layer 3: Sparkle overtone ---
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(1760, now + 0.05);
    sparkleGain.gain.setValueAtTime(0, now);
    sparkleGain.gain.linearRampToValueAtTime(0.12, now + 0.06);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    sparkle.connect(sparkleGain);
    sparkleGain.connect(master);
    sparkle.start(now + 0.05);
    sparkle.stop(now + 0.25);
  } catch {
    // Audio not available — silently skip
  }
}
