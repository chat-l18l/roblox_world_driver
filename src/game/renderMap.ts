import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import countriesTopo from "world-atlas/countries-110m.json";
import { COUNTRIES, COUNTRY_BY_NUMERIC, type Country } from "@/model/countries.ts";
import { learnerStage, playableCountries } from "@/model/curriculum.ts";
import { bearingDeg, haversineKm } from "@/sim/geo.ts";
import type { Session } from "@/sim/session.ts";

const collection = feature(
  countriesTopo,
  countriesTopo.objects.countries,
) as unknown as FeatureCollection<Geometry, { name?: string }>;

export type Cam = { lat: number; lon: number; zoom: number; trauma: number };

export function createCam(s: Session): Cam {
  return {
    lat: s.vehicle.lat,
    lon: s.vehicle.lon,
    zoom: s.vehicle.craft === "plane" ? 320 : 1600,
    trauma: 0,
  };
}

export function stepCam(cam: Cam, s: Session, dt: number, w: number, h: number): Cam {
  const dest = s.mission
    ? COUNTRIES.find((c) => c.iso === s.mission?.destIso)
    : undefined;
  const heading = s.vehicle.heading;
  const look = 0.08;
  let leadLat = s.vehicle.lat + Math.cos(heading) * look;
  let leadLon = s.vehicle.lon + Math.sin(heading) * look;
  let targetZoom =
    s.vehicle.craft === "plane" ? Math.max(280, w * 0.28) : Math.max(900, w * 0.95);

  if (dest) {
    leadLat = s.vehicle.lat * 0.62 + dest.lat * 0.38;
    leadLon = s.vehicle.lon * 0.62 + dest.lon * 0.38;
    const probe = geoMercator()
      .scale(1000)
      .center([s.vehicle.lon, s.vehicle.lat])
      .translate([0, 0]);
    const a = probe([s.vehicle.lon, s.vehicle.lat]);
    const b = probe([dest.lon, dest.lat]);
    if (a && b) {
      const dist = Math.max(24, Math.hypot(b[0] - a[0], b[1] - a[1]));
      const wanted = Math.min(w, h) * 0.46;
      targetZoom = clamp(1000 * (wanted / dist), 520, 2800);
    }
  }

  const k = 1 - Math.exp(-3.2 * dt);
  return {
    lat: cam.lat + (leadLat - cam.lat) * k,
    lon: cam.lon + (leadLon - cam.lon) * k,
    zoom: cam.zoom + (targetZoom - cam.zoom) * k,
    trauma: Math.max(0, cam.trauma - dt * 1.8),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function addTrauma(cam: Cam, amount: number): Cam {
  return { ...cam, trauma: Math.min(1, cam.trauma + amount) };
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  s: Session,
  cam: Cam,
  cssW: number,
  cssH: number,
  now: number,
): void {
  ctx.save();
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = "#c5d4dc";
  ctx.fillRect(0, 0, cssW, cssH);

  const shake = cam.trauma * cam.trauma;
  const ox = shake ? (Math.sin(now * 37) * 10 + Math.sin(now * 11) * 4) * shake : 0;
  const oy = shake ? Math.cos(now * 29) * 8 * shake : 0;

  const projection = geoMercator()
    .scale(cam.zoom)
    .center([cam.lon, cam.lat])
    .translate([cssW / 2 + ox, cssH / 2 + oy]);
  const path = geoPath(projection, ctx);

  const destIso = s.mission?.destIso;
  const dest = destIso ? COUNTRIES.find((c) => c.iso === destIso) : null;
  const stage = learnerStage(s.mastery);

  ctx.lineJoin = "round";
  ctx.lineWidth = 0.8;
  for (const f of collection.features) {
    const id = Number(f.id);
    const known = COUNTRY_BY_NUMERIC.get(id);
    const isDest = Boolean(known && known.iso === destIso);
    const mastered = known ? (s.mastery[known.iso] ?? 0) >= 2 : false;
    ctx.beginPath();
    path(f as Feature<Geometry>);
    if (isDest) ctx.fillStyle = "#cbb89a";
    else if (mastered) ctx.fillStyle = "#d4cbb3";
    else ctx.fillStyle = "#d9d0be";
    ctx.fill();
    ctx.strokeStyle = "#b7ae9a";
    ctx.stroke();
  }

  if (dest) {
    const p = projection([dest.lon, dest.lat]);
    if (p) {
      const pulse = 10 + Math.sin(now * 4) * 4;
      ctx.beginPath();
      ctx.arc(p[0], p[1], pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "#8f3d32";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#8f3d32";
      ctx.fill();
    }
  }

  if (stage === "novice" || stage === "apprentice") {
    ctx.font = "600 11px 'Source Sans 3', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const allowed = new Set(playableCountries(s.mastery).map((c) => c.iso));
    if (destIso) allowed.add(destIso);
    const placed: [number, number][] = [];
    for (const c of COUNTRIES) {
      if (!allowed.has(c.iso)) continue;
      const p = projection([c.lon, c.lat]);
      if (!p) continue;
      if (p[0] < 24 || p[1] < 28 || p[0] > cssW - 24 || p[1] > cssH - 24) continue;
      if (placed.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 46)) continue;
      placed.push([p[0], p[1]]);
      ctx.fillStyle = c.iso === destIso ? "#8f3d32" : "#1c2430";
      const label = stage === "novice" ? `${c.nameNl} · ${c.capital}` : c.nameNl;
      ctx.fillText(label, p[0], p[1] - 8);
    }
  }

  const van = projection([s.vehicle.lon, s.vehicle.lat]);
  if (van) {
    drawCraft(ctx, van[0], van[1], s.vehicle.heading, s.vehicle.craft);
    if (dest && s.state === "transit") {
      const d = projection([dest.lon, dest.lat]);
      if (d) {
        ctx.beginPath();
        ctx.moveTo(van[0], van[1]);
        ctx.lineTo(d[0], d[1]);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(28,36,48,0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  ctx.restore();
}

function drawCraft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
  craft: "van" | "plane",
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  if (craft === "plane") {
    ctx.fillStyle = "#3a5366";
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(5, 10);
    ctx.lineTo(0, 6);
    ctx.lineTo(-5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-11, -2, 22, 3);
  } else {
    ctx.fillStyle = "#3a5366";
    roundRect(ctx, -7, -12, 14, 22, 3);
    ctx.fill();
    ctx.fillStyle = "#1c2430";
    roundRect(ctx, -5.5, -10, 11, 7, 2);
    ctx.fill();
    ctx.fillStyle = "#8f3d32";
    ctx.fillRect(-4, 4, 8, 5);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function routeInfo(s: Session): { km: number; bearing: number } | null {
  if (!s.mission) return null;
  const dest = COUNTRIES.find((c) => c.iso === s.mission?.destIso);
  if (!dest) return null;
  return {
    km: haversineKm(s.vehicle.lat, s.vehicle.lon, dest.lat, dest.lon),
    bearing: bearingDeg(s.vehicle.lat, s.vehicle.lon, dest.lat, dest.lon),
  };
}

export function countryOf(iso: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso === iso);
}
