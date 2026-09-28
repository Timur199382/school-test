// Звуковой движок на Web Audio API: фоновая музыка, звуки верного/неверного ответа, победа.
// Всё генерируется синтезом — без внешних файлов.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let muted = false;

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function isMuted() {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem('trainer-muted', m ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (master && ctx) {
    master.gain.linearRampToValueAtTime(m ? 0 : 1, ctx.currentTime + 0.15);
  }
}

export function initMute() {
  try {
    muted = localStorage.getItem('trainer-muted') === '1';
  } catch {
    muted = false;
  }
  return muted;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  dest?: AudioNode
) {
  const c = ensureCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(dest || master!);
  o.start(start);
  o.stop(start + dur + 0.05);
}

/** Верный ответ — весёлый мажорный арпеджио */
export function playCorrect() {
  if (muted) return;
  const c = ensureCtx();
  const t = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(f, t + i * 0.09, 0.35, 'triangle', 0.22)
  );
  tone(1568, t + 0.36, 0.5, 'sine', 0.12);
}

/** Неверный ответ — мягкий «бузз» + понижение */
export function playWrong() {
  if (muted) return;
  const c = ensureCtx();
  const t = c.currentTime;
  tone(196, t, 0.28, 'sawtooth', 0.1);
  tone(155.56, t + 0.22, 0.4, 'sawtooth', 0.1);
  tone(233, t, 0.25, 'square', 0.04);
}

/** Победная фанфара */
export function playVictory() {
  if (muted) return;
  const c = ensureCtx();
  const t = c.currentTime;
  const seq = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
  seq.forEach((f, i) => tone(f, t + i * 0.13, 0.3, 'triangle', 0.2));
  [523.25, 659.25, 783.99].forEach((f) => tone(f, t + 0.85, 1.1, 'triangle', 0.14));
}

/** Щелчок кнопки */
export function playClick() {
  if (muted) return;
  const c = ensureCtx();
  tone(880, c.currentTime, 0.07, 'sine', 0.12);
}

// Вдохновляющий аккомпанемент: прогрессия C – G – Am – F с тёплым пэдом,
// нарастающим арпеджио и мягким басом.
const PROG = [
  { bass: 130.81, pad: [261.63, 329.63, 392.0], arp: [523.25, 659.25, 783.99, 659.25, 1046.5, 783.99, 659.25, 587.33] },
  { bass: 98.0, pad: [246.94, 293.66, 392.0], arp: [587.33, 783.99, 987.77, 783.99, 1174.66, 987.77, 783.99, 659.25] },
  { bass: 110.0, pad: [220.0, 261.63, 329.63], arp: [523.25, 659.25, 880.0, 659.25, 1046.5, 880.0, 659.25, 523.25] },
  { bass: 87.31, pad: [174.61, 261.63, 349.23], arp: [523.25, 698.46, 880.0, 698.46, 1046.5, 880.0, 698.46, 523.25] },
];
const STEPS_PER_CHORD = 8;

/** Вдохновляющая фоновая музыка */
export function startMusic() {
  if (musicTimer !== null) return;
  const c = ensureCtx();
  musicGain = c.createGain();
  musicGain.gain.value = 0.5;
  musicGain.connect(master!);
  let step = 0;
  const tick = () => {
    if (!musicGain || !ctx) return;
    const t = ctx.currentTime + 0.05;
    const chord = PROG[Math.floor(step / STEPS_PER_CHORD) % PROG.length];
    const inChord = step % STEPS_PER_CHORD;
    // пэд в начале такта аккорда
    if (inChord === 0) {
      chord.pad.forEach((f) => tone(f, t, STEPS_PER_CHORD * 0.31, 'sine', 0.028, musicGain!));
      tone(chord.bass, t, STEPS_PER_CHORD * 0.31, 'triangle', 0.05, musicGain!);
    }
    // арпеджио — «нарастающий» ритм
    tone(chord.arp[inChord], t, 0.26, 'triangle', 0.05 + inChord * 0.004, musicGain!);
    if (inChord % 2 === 1) tone(chord.arp[inChord] * 2, t, 0.14, 'sine', 0.012, musicGain!);
    step++;
  };
  tick();
  musicTimer = window.setInterval(tick, 310);
}

export function stopMusic() {
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (musicGain) {
    try {
      musicGain.disconnect();
    } catch {
      /* ignore */
    }
    musicGain = null;
  }
}
