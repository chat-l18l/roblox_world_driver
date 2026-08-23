/** Sphere math used by the sim. No DOM. */

const M_PER_DEG_LAT = 111_320;

export function wrapLon(lon: number): number {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

export function clampLat(lat: number): number {
  return Math.max(-80, Math.min(80, lat));
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r = 6371;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/** heading: 0 = north, increases clockwise. A (left) decreases heading. */
export function stepLatLon(
  lat: number,
  lon: number,
  heading: number,
  speedMps: number,
  dt: number,
): { lat: number; lon: number } {
  const dist = speedMps * dt;
  const dLat = (dist * Math.cos(heading)) / M_PER_DEG_LAT;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const denom = M_PER_DEG_LAT * Math.max(0.2, Math.abs(cosLat));
  const dLon = (dist * Math.sin(heading)) / denom;
  return {
    lat: clampLat(lat + dLat),
    lon: wrapLon(lon + dLon),
  };
}

export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}
