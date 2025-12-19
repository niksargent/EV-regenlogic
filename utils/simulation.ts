import { SimulationParams, SimulationResult, SimulationStep } from '../types';
import { AIR_DENSITY, GRAVITY } from '../constants';

export const runSimulation = (params: SimulationParams): SimulationResult => {
  const {
    mass,
    initialSpeed,
    distance: targetDistance,
    dragCoefficient,
    frontalArea,
    rollingResistance,
    regenEfficiency,
    brakingDistance,
    applyRegenToStrategyA
  } = params;

  const v0 = initialSpeed / 3.6; // Convert km/h to m/s
  const dt = 0.1; // Time step (seconds)
  const brakeStartDist = Math.max(0, targetDistance - brakingDistance);

  // --- Strategy A: Coasting (Lift off at t=0) ---
  // If applyRegenToStrategyA is true, it also applies regen at brakeStartDist if needed.
  const stepsA: SimulationStep[] = [];
  let v = v0;
  let x = 0;
  let t = 0;
  let energyA = 0; // Joules

  stepsA.push({ distance: 0, speed: v0 * 3.6, time: 0, energyNet: 0, power: 0 });

  while (v > 0.1 && x < targetDistance * 1.5) {
    const F_aero = 0.5 * AIR_DENSITY * dragCoefficient * frontalArea * v * v;
    const F_roll = rollingResistance * mass * GRAVITY;
    const F_drag_total = F_aero + F_roll; // Magnitude of drag

    let F_motor = 0;

    // Optional Regen for Strategy A
    if (applyRegenToStrategyA && x >= brakeStartDist) {
        const remainingDist = targetDistance - x;
        
        if (remainingDist <= 0.1) {
            v = 0;
        } else {
            // Calculate required acceleration to stop at target
            const a_req = -(v * v) / (2 * remainingDist); 
            // F_net = m * a_req
            // F_net = -F_drag_total + F_motor
            // F_motor = m * a_req + F_drag_total
            const F_req = mass * a_req + F_drag_total;
            
            // Only apply motor force if we need to BRAKE (F_req < 0).
            // If F_req > 0, it means drag is already slowing us down TOO FAST to reach target (we would stop short).
            // In a "Coast" strategy, we don't add power, we just let it stop short.
            if (F_req < 0) {
                F_motor = F_req;
            }
        }
    }

    // Physics Update
    const F_net = -F_drag_total + F_motor;
    const a = F_net / mass;

    v += a * dt;
    if (v < 0) v = 0;
    
    const dx = v * dt;
    x += dx;
    t += dt;

    // Energy Calculation
    let stepEnergy = 0;
    let stepPower = 0;

    if (F_motor < 0) {
        // Regen
        stepEnergy = F_motor * dx * regenEfficiency;
        stepPower = F_motor * v * regenEfficiency;
    } else if (F_motor > 0) {
        // Should not happen in Strategy A based on logic above, but for completeness
        stepEnergy = F_motor * dx; 
        stepPower = F_motor * v;
    }
    
    energyA += stepEnergy;

    stepsA.push({
      distance: x,
      speed: v * 3.6, // km/h
      time: t,
      energyNet: energyA,
      power: stepPower
    });

    if (t > 600) break; // Safety break
  }
  
  // --- Strategy B: Drive then Regen ---
  const stepsB: SimulationStep[] = [];
  v = v0;
  x = 0;
  t = 0;
  let energyB = 0; // Joules
  
  stepsB.push({ distance: 0, speed: v0 * 3.6, time: 0, energyNet: 0, power: 0 });

  while (v > 0.1 && x < targetDistance + 5) {
    let F_motor = 0;
    const F_aero = 0.5 * AIR_DENSITY * dragCoefficient * frontalArea * v * v;
    const F_roll = rollingResistance * mass * GRAVITY;
    const F_drag_total = F_aero + F_roll;

    if (x < brakeStartDist) {
      // Phase 1: Maintain Speed
      F_motor = F_drag_total; 
      
      const dx = v * dt;
      x += dx;
      t += dt;
      
      const stepEnergy = F_motor * dx;
      energyB += stepEnergy;

      stepsB.push({
        distance: x,
        speed: v * 3.6,
        time: t,
        energyNet: energyB,
        power: F_motor * v
      });

    } else {
      // Phase 2: Braking
      const remainingDist = targetDistance - x;
      if (remainingDist <= 0.1) {
        v = 0;
      } else {
        const a_req = -(v * v) / (2 * remainingDist);
        
        // F_motor needed to achieve a_req given current drag
        let F_applied = mass * a_req + F_drag_total;

        // Update physics
        const a = (F_applied - F_drag_total) / mass; // Should equal a_req basically
        
        v += a * dt;
        if (v < 0) v = 0;
        
        const dx = v * dt;
        x += dx;
        t += dt;

        let stepEnergy = 0;
        let stepPower = 0;

        if (F_applied < 0) {
          // Regen
          stepEnergy = F_applied * dx * regenEfficiency;
          stepPower = F_applied * v * regenEfficiency;
        } else {
          // Powered driving (crawling)
          stepEnergy = F_applied * dx;
          stepPower = F_applied * v;
        }

        energyB += stepEnergy;

        stepsB.push({
            distance: x,
            speed: v * 3.6,
            time: t,
            energyNet: energyB,
            power: stepPower
        });
      }
    }

    if (t > 600) break;
  }

  const lastA = stepsA[stepsA.length - 1];
  const lastB = stepsB[stepsB.length - 1];

  return {
    strategyA: stepsA,
    strategyB: stepsB,
    summary: {
      timeA: lastA.time,
      timeB: lastB.time,
      energyA: lastA.energyNet / 3600, // Wh
      energyB: lastB.energyNet / 3600, // Wh
      finalDistanceA: lastA.distance,
      finalDistanceB: lastB.distance,
      didReachTargetA: lastA.distance >= targetDistance - 2,
    }
  };
};