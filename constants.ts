export const AIR_DENSITY = 1.225; // kg/m^3 at sea level
export const GRAVITY = 9.81; // m/s^2

export const DEFAULT_PARAMS = {
  mass: 1800, // Tesla Model 3-ish
  initialSpeed: 60, // km/h
  distance: 500, // meters
  dragCoefficient: 0.23,
  frontalArea: 2.22,
  rollingResistance: 0.01,
  regenEfficiency: 0.70, // 70%
  brakingDistance: 50, // meters
  applyRegenToStrategyA: false, // Default to pure coasting
};