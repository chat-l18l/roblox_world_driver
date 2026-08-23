import { stepLatLon, wrapAngle } from "./geo.ts";

export type Craft = "van" | "plane";

export type Vehicle = {
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  craft: Craft;
};

export type DriveInput = {
  /** -1 reverse .. +1 forward */
  throttle: number;
  /** +1 player-left, -1 player-right (north-up map, heading 0 = north) */
  steer: number;
};

export const VAN_MAX_SPEED = 28_000;
export const PLANE_MAX_SPEED = 110_000;
export const VAN_ACCEL = 22_000;
export const PLANE_ACCEL = 40_000;
export const TURN_RATE = 2.15;
export const DRAG = 0.55;
export const PLANE_DISTANCE_KM = 1_800;

export function maxSpeed(craft: Craft): number {
  return craft === "plane" ? PLANE_MAX_SPEED : VAN_MAX_SPEED;
}

export function accelOf(craft: Craft): number {
  return craft === "plane" ? PLANE_ACCEL : VAN_ACCEL;
}

export function createVehicle(lat: number, lon: number, craft: Craft = "van"): Vehicle {
  return { lat, lon, heading: 0, speed: 0, craft };
}

export function chooseCraft(distanceKm: number): Craft {
  return distanceKm >= PLANE_DISTANCE_KM ? "plane" : "van";
}

export function stepVehicle(v: Vehicle, input: DriveInput, dt: number): Vehicle {
  const cap = maxSpeed(v.craft);
  const acc = accelOf(v.craft);
  const throttle = clamp(input.throttle, -1, 1);
  const steer = clamp(input.steer, -1, 1);

  let speed = v.speed + throttle * acc * dt;
  speed -= speed * DRAG * dt;
  speed = clamp(speed, -cap * 0.35, cap);

  const speedFactor = 0.28 + 0.72 * Math.min(1, Math.abs(speed) / cap);
  const reverse = speed >= 0 ? 1 : -1;
  const heading = wrapAngle(
    v.heading - steer * TURN_RATE * speedFactor * reverse * dt,
  );

  const pos = stepLatLon(v.lat, v.lon, heading, speed, dt);
  return { ...v, ...pos, heading, speed };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
