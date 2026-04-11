/** Short band-pass noise sweep + low hum — no external asset; plays whenever called. */

const AudioCtor =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : null;

let sharedCtx: AudioContext | null = null;

function getSharedContext(): AudioContext | null {
  if (!AudioCtor) return null;
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioCtor();
  }
  return sharedCtx;
}

/** Μετά το πρώτο user gesture το context μπορεί να τρέξει (Chrome autoplay policy). */
function attachGestureUnlock(): void {
  if (typeof document === 'undefined') return;
  const unlock = () => {
    const c = getSharedContext();
    if (c?.state === 'suspended') void c.resume().catch(() => {});
  };
  document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  document.addEventListener('keydown', unlock, { capture: true, passive: true });
}

attachGestureUnlock();

function scheduleSplashOnContext(ctx: AudioContext): void {
  const duration = 1.55;

  const n = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
  const ch = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 2.2;

  const hum = ctx.createOscillator();
  hum.type = 'sine';

  const humGain = ctx.createGain();
  const noiseGain = ctx.createGain();
  const master = ctx.createGain();
  master.gain.value = 0.85;

  src.connect(bp);
  bp.connect(noiseGain);
  noiseGain.connect(master);
  hum.connect(humGain);
  humGain.connect(master);
  master.connect(ctx.destination);

  const t = ctx.currentTime;
  bp.frequency.setValueAtTime(280, t);
  bp.frequency.exponentialRampToValueAtTime(5200, t + duration * 0.92);
  noiseGain.gain.setValueAtTime(0.0001, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.11, t + 0.06);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  hum.frequency.setValueAtTime(55, t);
  hum.frequency.exponentialRampToValueAtTime(95, t + duration);
  humGain.gain.setValueAtTime(0.0001, t);
  humGain.gain.exponentialRampToValueAtTime(0.035, t + 0.08);
  humGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.start(t);
  src.stop(t + duration);
  hum.start(t);
  hum.stop(t + duration);
}

export function playSplashDrawSfx(): void {
  const ctx = getSharedContext();
  if (!ctx || ctx.state !== 'running') return;
  try {
    scheduleSplashOnContext(ctx);
  } catch {
    /* graph setup failed */
  }
}

/** Κάλεσέ το μέσα σε user gesture (π.χ. pointerdown) ώστε το `resume()` να επιτρέπεται — μετά παίζει ο ήχος. */
export function playSplashDrawSfxFromUserGesture(): void {
  const ctx = getSharedContext();
  if (!ctx) return;
  void ctx
    .resume()
    .then(() => {
      if (ctx.state === 'running') {
        try {
          scheduleSplashOnContext(ctx);
        } catch {
          /* ignore */
        }
      }
    })
    .catch(() => {});
}
