export interface LaunchState {
  altitude: number; // km (0 to 140)
  velocity: number; // km/h (0 to 28140)
  verticalVelocity: number; // km/h
  horizontalVelocity: number; // km/h
  mach: number;
  throttle: number; // 0 to 1
  gForce: number; // Gs (1.0 to 4.2)
  acceleration: number; // m/s^2
  pitch: number; // degrees: 90 is straight up, 5 is nearly orbital horizontal
  targetPitch: number; // optimal gravity turn pitch for current altitude
  corridorOffset: number; // -1 to 1: deviation from center of flight corridor
  stage: 1 | 2 | 'orbit';
  stage1Fuel: number; // 0 to 1 (Solid Rocket Boosters)
  stage2Fuel: number; // 0 to 1 (External Tank)
  readyToSeparate: boolean;
  stageSeparated: boolean;
  etSeparated: boolean;
  maxQPassed: boolean;
  karmanPassed: boolean;
  orbitalInsertion: boolean;
  missionTime: number; // seconds
  statusText: string;

  // Rich Aerospace Telemetry Stats
  dynamicPressure: number; // kPa (Max-Q peak ~34 kPa at Mach 1.5)
  downrangeDistance: number; // km over the Atlantic Ocean
  chamberPressure: number; // % (SSME throttle: 104.5% normal, 72% at Max-Q)
  propellantMass: number; // tonnes remaining (starts at 1980 t)
  projectedApogee: number; // km
  orbitalInclination: number; // degrees (28.5° from KSC)
  timeWarp: number; // 0.5x, 1x, 2x, 4x
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
    horizontalVelocity: 0,
    mach: 0,
    throttle: 1.0,
    gForce: 1.0,
    acceleration: 9.81,
    pitch: 90,
    targetPitch: 90,
    corridorOffset: 0,
    stage: 1,
    stage1Fuel: 1.0,
    stage2Fuel: 1.0,
    readyToSeparate: false,
    stageSeparated: false,
    etSeparated: false,
    maxQPassed: false,
    karmanPassed: false,
    orbitalInsertion: false,
    missionTime: 0,
    statusText: 'PAD 39B // APPOINTMENT WITH ORBIT',

    dynamicPressure: 0.0,
    downrangeDistance: 0.0,
    chamberPressure: 104.5,
    propellantMass: 1980,
    projectedApogee: 0.1,
    orbitalInclination: 28.5,
    timeWarp: 1.0,
  };
}

export function calculateTargetPitch(altitude: number): number {
  if (altitude < 2) return 90; // vertical climb off pad
  if (altitude < 12) return 90 - ((altitude - 2) / 10) * 16; // 90 -> 74 deg
  if (altitude < 40) return 74 - ((altitude - 12) / 28) * 26; // 74 -> 48 deg
  if (altitude < 70) return 48 - ((altitude - 40) / 30) * 24; // 48 -> 24 deg
  if (altitude < 100) return 24 - ((altitude - 70) / 30) * 16; // 24 -> 8 deg
  return 6; // near horizontal orbital injection
}

export function stepLaunchPhysics(
  state: LaunchState,
  baseDt: number,
  input: LaunchInput,
  started: boolean
): LaunchState {
  if (!started || state.orbitalInsertion) {
    return state;
  }

  const s = { ...state };
  // Multiply delta time by time warp factor
  const dt = baseDt * (s.timeWarp || 1.0);
  s.missionTime += dt;

  // Throttle adjustments
  if (input.throttleUp) s.throttle = Math.min(1.0, s.throttle + dt * 0.8);
  if (input.throttleDown) s.throttle = Math.max(0.15, s.throttle - dt * 0.8);

  // Steer controls
  const steerRate = 0.55 * dt;
  if (input.steerLeft) s.corridorOffset = Math.max(-1.0, s.corridorOffset - steerRate);
  if (input.steerRight) s.corridorOffset = Math.min(1.0, s.corridorOffset + steerRate);

  if (!input.steerLeft && !input.steerRight) {
    const windDrift = Math.sin(s.missionTime * 0.7) * 0.07 * dt;
    s.corridorOffset = Math.max(-1.0, Math.min(1.0, s.corridorOffset + windDrift));
  }

  // Calculate target pitch according to gravity turn profile
  s.targetPitch = calculateTargetPitch(s.altitude);
  const pilotPitchBias = s.corridorOffset * -5;
  s.pitch += (s.targetPitch + pilotPitchBias - s.pitch) * (dt * 1.4);

  const pitchRad = (s.pitch * Math.PI) / 180;

  // Calculate Atmospheric Density (kg/m^3)
  // Scale height ~ 7.2 km
  const atmoDensity = 1.225 * Math.exp(-s.altitude / 7.2);
  const vMetersSec = (s.velocity * 1000) / 3600;

  // Dynamic Pressure Q (kPa) = 0.5 * rho * v^2 / 1000
  s.dynamicPressure = (0.5 * atmoDensity * vMetersSec * vMetersSec) / 1000;

  // SSME Chamber Pressure: Throttle bucket to 72% during Max-Q (11 - 16 km) to protect structure
  if (s.altitude >= 10 && s.altitude <= 17 && s.stage === 1) {
    s.chamberPressure = 72.0;
  } else if (s.stage !== 'orbit') {
    s.chamberPressure = 104.5 * s.throttle;
  } else {
    s.chamberPressure = 0.0;
  }

  // --- STAGE 1: SRB + SSME BOOST ---
  if (s.stage === 1) {
    const fuelRate = 0.036 * s.throttle * dt;
    s.stage1Fuel = Math.max(0, s.stage1Fuel - fuelRate);
    s.propellantMass = Math.max(760, 1980 - (1 - s.stage1Fuel) * 1150);

    // Thrust & Acceleration
    const baseThrust = 460 * s.throttle;
    const effectiveThrust = s.stage1Fuel > 0 ? baseThrust : 0;
    const gravityLoss = 9.81 * 3.6 * Math.sin(pitchRad) * dt;

    const netAccel = effectiveThrust * dt - gravityLoss;
    s.velocity = Math.max(0, s.velocity + netAccel);

    s.gForce = s.stage1Fuel > 0 ? 1.0 + (s.throttle * (1.3 + (1 - s.stage1Fuel) * 2.1)) : 0.25;
    s.acceleration = s.gForce * 9.81;

    // Status milestones
    if (s.altitude < 1) {
      s.statusText = 'LIFTOFF! TOWER CLEARED // ROLL PROGRAM COMPLETE';
    } else if (s.altitude >= 10 && !s.maxQPassed) {
      s.statusText = 'PASSING MAX-Q // TRANSONIC SHOCK CONE';
      if (s.altitude > 15) s.maxQPassed = true;
    } else if (s.stage1Fuel <= 0) {
      s.readyToSeparate = true;
      s.statusText = 'SRB BURNOUT! SEPARATION READY';
    } else {
      s.statusText = 'STAGE 1 BOOST // GRAVITY TURN IN PROGRESS';
    }

    // Trigger stage separation
    if (s.readyToSeparate && (input.separateStage || s.stage1Fuel <= 0 && s.altitude > 48)) {
      s.stage = 2;
      s.readyToSeparate = false;
      s.stageSeparated = true;
      s.gForce = 0.1;
      s.statusText = 'SRB SEPARATION CONFIRMED! 3 SSME MAIN ENGINES CONTINUING';
    }
  }

  // --- STAGE 2: SSME + EXTERNAL TANK TO ORBIT ---
  else if (s.stage === 2) {
    const fuelRate = 0.022 * s.throttle * dt;
    s.stage2Fuel = Math.max(0, s.stage2Fuel - fuelRate);
    s.propellantMass = Math.max(110, 760 - (1 - s.stage2Fuel) * 650);

    const baseThrust = 860 * s.throttle;
    const effectiveThrust = s.stage2Fuel > 0 ? baseThrust : 0;
    const gravityLoss = 9.81 * 3.6 * Math.sin(pitchRad) * 0.65 * dt;

    s.velocity += (effectiveThrust * dt - gravityLoss);
    s.gForce = s.stage2Fuel > 0 ? 1.0 + (s.throttle * 2.4) : 0.0;
    s.acceleration = s.gForce * 9.81;

    if (s.altitude >= 100 && !s.karmanPassed) {
      s.karmanPassed = true;
      s.statusText = 'CROSSING KÁRMÁN LINE (100 KM) // WELCOME TO SPACE';
    } else if (s.altitude < 100) {
      s.statusText = 'STAGE 2 VACUUM ACCELERATION // PRESS TO MECO';
    }

    if (s.altitude >= 115 && !s.etSeparated) {
      s.etSeparated = true;
      s.statusText = 'MECO CONFIRMED! EXTERNAL TANK SEPARATION';
    }

    // Check for orbital insertion criteria
    if (s.altitude >= 125 || s.velocity >= 27800) {
      s.stage = 'orbit';
      s.orbitalInsertion = true;
      s.gForce = 0.0;
      s.acceleration = 0.0;
      s.velocity = 28140;
      s.altitude = 135.2;
      s.statusText = 'ORBIT INSERTION CONFIRMED // LOW EARTH ORBIT (LEO)';
    }
  }

  // Motion integration
  s.mach = s.velocity / 1225;
  s.verticalVelocity = s.velocity * Math.sin(pitchRad);
  s.horizontalVelocity = s.velocity * Math.cos(pitchRad);

  const altGain = (s.verticalVelocity / 3600) * dt;
  s.altitude = Math.max(0.05, s.altitude + altGain);

  const downrangeGain = (s.horizontalVelocity / 3600) * dt;
  s.downrangeDistance += downrangeGain;

  // Projected apogee: current altitude + kinetic energy converted to potential
  const kineticAlt = (vMetersSec * vMetersSec) / (2 * 9.81 * 1000);
  s.projectedApogee = Math.min(142, Math.max(s.altitude, s.altitude + kineticAlt * 0.28));

  return s;
}
