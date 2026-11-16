export interface LaunchState {
  altitude: number; // km (0 to 140)
  velocity: number; // km/h (0 to 28000)
  verticalVelocity: number; // km/h
  mach: number;
  throttle: number; // 0 to 1
  gForce: number; // Gs (1.0 to 4.2)
  pitch: number; // degrees: 90 is straight up, 5 is nearly orbital horizontal
  targetPitch: number; // optimal gravity turn pitch for current altitude
  corridorOffset: number; // -1 to 1: deviation from center of flight corridor
  stage: 1 | 2 | 'orbit';
  stage1Fuel: number; // 0 to 1
  stage2Fuel: number; // 0 to 1
  readyToSeparate: boolean;
  stageSeparated: boolean;
  maxQPassed: boolean;
  karmanPassed: boolean;
  orbitalInsertion: boolean;
  missionTime: number; // seconds
  statusText: string;
}

export interface LaunchInput {
  throttleUp: boolean;
  throttleDown: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  separateStage: boolean;
}

export function createInitialLaunchState(): LaunchState {
  return {
    altitude: 0.05,
    velocity: 0,
    verticalVelocity: 0,
    mach: 0,
    throttle: 1.0, // starts primed for ignition
    gForce: 1.0,
    pitch: 90,
    targetPitch: 90,
    corridorOffset: 0,
    stage: 1,
    stage1Fuel: 1.0,
    stage2Fuel: 1.0,
    readyToSeparate: false,
    stageSeparated: false,
    maxQPassed: false,
    karmanPassed: false,
    orbitalInsertion: false,
    missionTime: 0,
    statusText: 'PAD 39A // STANDBY FOR LIFTOFF',
  };
}

export function calculateTargetPitch(altitude: number): number {
  if (altitude < 2) return 90; // vertical climb off pad
  if (altitude < 12) return 90 - ((altitude - 2) / 10) * 15; // 90 -> 75 deg
  if (altitude < 40) return 75 - ((altitude - 12) / 28) * 25; // 75 -> 50 deg
  if (altitude < 70) return 50 - ((altitude - 40) / 30) * 25; // 50 -> 25 deg
  if (altitude < 100) return 25 - ((altitude - 70) / 30) * 15; // 25 -> 10 deg
  return 8; // near horizontal orbital injection
}

export function stepLaunchPhysics(
  state: LaunchState,
  dt: number,
  input: LaunchInput,
  started: boolean
): LaunchState {
  if (!started || state.orbitalInsertion) {
    return state;
  }

  const s = { ...state };
  s.missionTime += dt;

  // Throttle adjustments
  if (input.throttleUp) s.throttle = Math.min(1.0, s.throttle + dt * 0.8);
  if (input.throttleDown) s.throttle = Math.max(0.1, s.throttle - dt * 0.8);

  // Steer controls
  const steerRate = 0.5 * dt;
  if (input.steerLeft) s.corridorOffset = Math.max(-1.0, s.corridorOffset - steerRate);
  if (input.steerRight) s.corridorOffset = Math.min(1.0, s.corridorOffset + steerRate);
  // Natural corridor drift (winds, aerodynamics)
  if (!input.steerLeft && !input.steerRight) {
    const windDrift = Math.sin(s.missionTime * 0.8) * 0.08 * dt;
    s.corridorOffset = Math.max(-1.0, Math.min(1.0, s.corridorOffset + windDrift));
  }

  // Calculate target pitch according to gravity turn profile
  s.targetPitch = calculateTargetPitch(s.altitude);
  // Smoothly blend pitch towards target, influenced by pilot steering
  const pilotPitchBias = s.corridorOffset * -5;
  s.pitch += (s.targetPitch + pilotPitchBias - s.pitch) * (dt * 1.5);

  const pitchRad = (s.pitch * Math.PI) / 180;

  // --- STAGE 1 FLIGHT ---
  if (s.stage === 1) {
    const fuelRate = 0.038 * s.throttle * dt;
    s.stage1Fuel = Math.max(0, s.stage1Fuel - fuelRate);

    // Thrust & Acceleration
    const baseThrust = 450 * s.throttle; // km/h/s
    const atmosphericDragFactor = Math.max(0.05, 1 - (s.altitude / 60));
    const effectiveThrust = s.stage1Fuel > 0 ? baseThrust : 0;

    // Gravity loss
    const gravityLoss = 9.81 * 3.6 * Math.sin(pitchRad) * dt;

    // Velocity update
    const netAccel = effectiveThrust * dt - gravityLoss;
    s.velocity = Math.max(0, s.velocity + netAccel);

    // G-Force
    s.gForce = s.stage1Fuel > 0 ? 1.0 + (s.throttle * (1.2 + (1 - s.stage1Fuel) * 2.2)) : 0.2;

    // Status updates
    if (s.altitude < 1) {
      s.statusText = 'LIFTOFF! TOWER CLEARED // CAPE CANAVERAL';
    } else if (s.altitude >= 10 && !s.maxQPassed) {
      s.statusText = 'PASSING MAX-Q // TRANSONIC VAPOR CONE';
      if (s.altitude > 14) s.maxQPassed = true;
    } else if (s.stage1Fuel <= 0) {
      s.readyToSeparate = true;
      s.statusText = 'STAGE 1 MECO! READY FOR SEPARATION';
    } else {
      s.statusText = 'STAGE 1 BOOST // GRAVITY TURN IN PROGRESS';
    }

    // Trigger stage separation
    if (s.readyToSeparate && (input.separateStage || s.stage1Fuel <= 0 && s.altitude > 50)) {
      s.stage = 2;
      s.readyToSeparate = false;
      s.stageSeparated = true;
      s.gForce = 0.1; // sudden zero-G moment during staging
      s.statusText = 'STAGE SEPARATION CONFIRMED! IGNITING STAGE 2';
    }
  }

  // --- STAGE 2 FLIGHT ---
  else if (s.stage === 2) {
    const fuelRate = 0.024 * s.throttle * dt;
    s.stage2Fuel = Math.max(0, s.stage2Fuel - fuelRate);

    // Vacuum engine high efficiency
    const baseThrust = 820 * s.throttle; // high vacuum specific impulse
    const effectiveThrust = s.stage2Fuel > 0 ? baseThrust : 0;
    const gravityLoss = 9.81 * 3.6 * Math.sin(pitchRad) * 0.7 * dt;

    s.velocity += (effectiveThrust * dt - gravityLoss);
    s.gForce = s.stage2Fuel > 0 ? 1.0 + (s.throttle * 2.5) : 0.0;

    if (s.altitude >= 100 && !s.karmanPassed) {
      s.karmanPassed = true;
      s.statusText = 'CROSSING KÁRMÁN LINE (100 KM) // WELCOME TO SPACE';
    } else if (s.altitude < 100) {
      s.statusText = 'STAGE 2 VACUUM BURN // APPROACHING ORBIT';
    }

    // Check for orbital insertion criteria: altitude >= 125 km & velocity >= 27500 km/h
    if (s.altitude >= 125 || s.velocity >= 27800) {
      s.stage = 'orbit';
      s.orbitalInsertion = true;
      s.gForce = 0.0; // microgravity!
      s.velocity = 28140; // stable orbital speed
      s.altitude = 135.2;
      s.statusText = 'ORBIT INSERTION CONFIRMED // LOW EARTH ORBIT (LEO)';
    }
  }

  // Motion integration
  s.mach = s.velocity / 1225;
  s.verticalVelocity = s.velocity * Math.sin(pitchRad);
  // Altitude in km: dt is in seconds, verticalVelocity in km/h -> km/h / 3600 = km/s
  const altGain = (s.verticalVelocity / 3600) * dt;
  s.altitude = Math.max(0.05, s.altitude + altGain);

  return s;
}
