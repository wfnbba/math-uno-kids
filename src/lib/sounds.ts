let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, audio.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + start + duration);
  osc.connect(g).connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration);
}

export function playDing() {
  tone(880, 0, 0.15);
  tone(1320, 0.1, 0.25);
}

export function playBuzz() {
  tone(200, 0, 0.25, "square", 0.08);
  tone(160, 0.1, 0.25, "square", 0.08);
}

export function playWin() {
  tone(523, 0, 0.18);
  tone(659, 0.15, 0.18);
  tone(784, 0.3, 0.18);
  tone(1047, 0.45, 0.4);
}
