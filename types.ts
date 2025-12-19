export interface SimulationParams {
  mass: number; // kg
  initialSpeed: number; // km/h
  distance: number; // meters (target stopping point)
  dragCoefficient: number; // Cd
  frontalArea: number; // m^2
  rollingResistance: number; // Crr
  regenEfficiency: number; // 0-1 (percentage)
  brakingDistance: number; // meters (for Strategy B and optionally A)
  applyRegenToStrategyA: boolean; // New switch
}

export interface SimulationStep {
  distance: number;
  speed: number;
  time: number;
  energyNet: number; // Joules (Positive = Used, Negative = Regenerated)
  power: number; // Watts
}

export interface SimulationResult {
  strategyA: SimulationStep[]; // Coasting
  strategyB: SimulationStep[]; // Regen Braking
  summary: {
    timeA: number;
    timeB: number;
    energyA: number; // Wh
    energyB: number; // Wh
    finalDistanceA: number;
    finalDistanceB: number;
    didReachTargetA: boolean;
  };
}