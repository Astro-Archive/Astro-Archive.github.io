/**
 * Blip de escritura del RPG.
 *
 * Web Audio en vez de <audio>: permite repetir el mismo sonido decenas de veces
 * por segundo sin latencia ni cortes. El MP3 se decodifica una vez y cada letra
 * lanza una fuente corta con una variación mínima de tono.
 *
 * Los navegadores exigen un gesto del usuario: `primeBlip` se llama al abrir la
 * entrevista (que ya es un clic) y `resumeBlip` en el primer clic o tecla.
 */

const SOURCE = 'sfx/text-blip.mp3';
const STORAGE_KEY = 'still-listening:sfx';
/** Dos blips más juntos que esto se oyen como un zumbido. */
const MIN_GAP = 0.075;
/** El MP3 trae ~50 ms de silencio de encoder al principio: se salta. */
const OFFSET = 0.048;
/** El archivo dura 0,31 s; recortado no se solapa consigo mismo. */
const DURATION = 0.09;
const FADE = 0.025;
const VOLUME = 0.4;

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;
let lastAt = 0;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'off';
  } catch {
    return false;
  }
}

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Crea el contexto y decodifica el MP3. Idempotente. */
export function primeBlip(): void {
  const audio = context();
  if (!audio || loading) return;

  if (audio.state === 'suspended') void audio.resume().catch(() => {});

  loading = fetch(SOURCE)
    .then((response) => {
      if (!response.ok) throw new Error(`blip: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => audio.decodeAudioData(data))
    .then((decoded) => {
      buffer = decoded;
    })
    .catch(() => {
      // sin sonido no se rompe la entrevista; se puede reintentar al reabrir
      loading = null;
    });
}

/** Desbloquea el audio en el primer gesto dentro de la entrevista. */
export function resumeBlip(): void {
  const audio = context();
  if (audio?.state === 'suspended') void audio.resume().catch(() => {});
  if (!buffer) primeBlip();
}

/** Suena una letra. El silencio, la puntuación y el volumen los decide quien llama. */
export function playTextBlip(): void {
  if (muted) return;

  const audio = context();
  if (!audio || !buffer || audio.state !== 'running') return;

  const now = audio.currentTime;
  if (now - lastAt < MIN_GAP) return;
  lastAt = now;

  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 0.96 + Math.random() * 0.08;

  const gain = audio.createGain();
  const start = audio.currentTime;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(VOLUME, start + 0.004);
  gain.gain.setValueAtTime(VOLUME, start + DURATION - FADE);
  gain.gain.linearRampToValueAtTime(0, start + DURATION);

  source.connect(gain).connect(audio.destination);
  source.start(start, OFFSET, DURATION);
}

export function isSoundOn(): boolean {
  return !muted;
}

/** Preferencia de sesión y entre visitas: apagar el sonido no debe repetirse. */
export function setSoundOn(on: boolean): void {
  muted = !on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* modo privado: la preferencia dura lo que la sesión */
  }
  if (on) resumeBlip();
}
