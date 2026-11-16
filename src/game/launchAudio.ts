/**
 * Procedural Web Audio API sound generator for the First-Person Rocket Launch.
 * Zero external audio files required: synthesizes authentic engine rumble,
 * countdown beeps, aerodynamic sonic booms, stage separation clunks,
 * and orbital insertion victory tones directly through the audio hardware.
 */

let audioCtx: AudioContext | null = null;
let engineNoiseNode: AudioBufferSourceNode | null = null;
let engineFilterNode: BiquadFilterNode | null = null;
let engineGainNode: GainNode | null = null;
let subOscNode: OscillatorNode | null = null;
let subGainNode: GainNode | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    audioCtx = new AudioCtor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function startRocketEngine() {
  const ctx = getContext();
  if (!ctx) return;

  stopRocketEngine();

  // Create 2 seconds of pink/brown low-frequency noise buffer
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }

  // Brown noise source
  engineNoiseNode = ctx.createBufferSource();
  engineNoiseNode.buffer = noiseBuffer;
  engineNoiseNode.loop = true;

  // Resonant low-pass filter (muffles or roars based on atmosphere/throttle)
  engineFilterNode = ctx.createBiquadFilter();
  engineFilterNode.type = 'lowpass';
  engineFilterNode.frequency.setValueAtTime(260, ctx.currentTime);
  engineFilterNode.Q.setValueAtTime(3.5, ctx.currentTime);

  engineGainNode = ctx.createGain();
  engineGainNode.gain.setValueAtTime(0.01, ctx.currentTime);
  engineGainNode.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.2);

  // Sub-harmonic bass oscillator (42 Hz) for chest-rumble engine vibration
  subOscNode = ctx.createOscillator();
  subOscNode.type = 'sawtooth';
  subOscNode.frequency.setValueAtTime(45, ctx.currentTime);

  subGainNode = ctx.createGain();
  subGainNode.gain.setValueAtTime(0.01, ctx.currentTime);
  subGainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.2);

  const subFilter = ctx.createBiquadFilter();
  subFilter.type = 'lowpass';
  subFilter.frequency.setValueAtTime(120, ctx.currentTime);

  engineNoiseNode.connect(engineFilterNode);
  engineFilterNode.connect(engineGainNode);
  engineGainNode.connect(ctx.destination);

  subOscNode.connect(subFilter);
  subFilter.connect(subGainNode);
  subGainNode.connect(ctx.destination);

  engineNoiseNode.start();
  subOscNode.start();
}

export function updateEngineAcoustics(throttle: number, altitude: number, stage: 1 | 2 | 'orbit') {
  const ctx = getContext();
  if (!ctx || !engineFilterNode || !engineGainNode || !subGainNode) return;

  if (stage === 'orbit') {
    // In space orbit with engines cut: silent vacuum
    engineGainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    subGainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    return;
  }

  // Throttle modulates volume
  const atmoDensity = Math.max(0.12, 1 - (altitude / 100));
  const targetGain = Math.max(0.05, throttle * 0.45 * atmoDensity);
  const targetFilterFreq = 160 + throttle * 400 * atmoDensity;

  engineGainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);
  engineFilterNode.frequency.setTargetAtTime(targetFilterFreq, ctx.currentTime, 0.1);
  subGainNode.gain.setTargetAtTime(throttle * 0.22, ctx.currentTime, 0.1);
}

export function playCountdownBeep(high = false) {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(high ? 1200 : 700, ctx.currentTime);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (high ? 0.35 : 0.15));

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + (high ? 0.36 : 0.16));
}

export function playSonicBoom() {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.6);

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.72);
}

export function playStageSeparationSound() {
  const ctx = getContext();
  if (!ctx) return;
  // Pyrotechnic explosive release bolt thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.65, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.46);
}

export function playOrbitalInsertionChime() {
  const ctx = getContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major triumph chord
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + idx * 0.12);
    osc.stop(ctx.currentTime + idx * 0.12 + 1.9);
  });
}

export function stopRocketEngine() {
  if (engineNoiseNode) {
    try { engineNoiseNode.stop(); } catch { /* ignore */ }
    engineNoiseNode.disconnect();
    engineNoiseNode = null;
  }
  if (subOscNode) {
    try { subOscNode.stop(); } catch { /* ignore */ }
    subOscNode.disconnect();
    subOscNode = null;
  }
}
