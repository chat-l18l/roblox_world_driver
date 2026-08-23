import { d as learnerStage, f as playableCountries, l as countryByIso, t as COUNTRIES, u as highestUnlockedRegion } from "./curriculum-BNjmyCpA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-CRvRAKAG.js
/** Sphere math used by the sim. No DOM. */
var M_PER_DEG_LAT = 111320;
function wrapLon(lon) {
	let x = lon;
	while (x > 180) x -= 360;
	while (x < -180) x += 360;
	return x;
}
function clampLat(lat) {
	return Math.max(-80, Math.min(80, lat));
}
function haversineKm(lat1, lon1, lat2, lon2) {
	const r = 6371;
	const p1 = lat1 * Math.PI / 180;
	const p2 = lat2 * Math.PI / 180;
	const dp = (lat2 - lat1) * Math.PI / 180;
	const dl = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
	return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function bearingDeg(lat1, lon1, lat2, lon2) {
	const p1 = lat1 * Math.PI / 180;
	const p2 = lat2 * Math.PI / 180;
	const dl = (lon2 - lon1) * Math.PI / 180;
	const y = Math.sin(dl) * Math.cos(p2);
	const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
	return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
/** heading: 0 = north, increases clockwise. A (left) decreases heading. */
function stepLatLon(lat, lon, heading, speedMps, dt) {
	const dist = speedMps * dt;
	const dLat = dist * Math.cos(heading) / M_PER_DEG_LAT;
	const cosLat = Math.cos(lat * Math.PI / 180);
	const denom = M_PER_DEG_LAT * Math.max(.2, Math.abs(cosLat));
	const dLon = dist * Math.sin(heading) / denom;
	return {
		lat: clampLat(lat + dLat),
		lon: wrapLon(lon + dLon)
	};
}
function wrapAngle(a) {
	return Math.atan2(Math.sin(a), Math.cos(a));
}
/** Deterministic mulberry32. Tests and mission picks stay replayable. */
function mulberry32(seed) {
	let t = seed >>> 0;
	return () => {
		t += 1831565813;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
}
function pickIndex(rng, n) {
	return Math.floor(rng() * n) % n;
}
function pickN(rng, items, n) {
	const copy = items.slice();
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const a = copy[i];
		copy[i] = copy[j];
		copy[j] = a;
	}
	return copy.slice(0, n);
}
var KINDS_BY_MASTERY = [
	["capital", "countryOf"],
	[
		"capital",
		"language",
		"countryOf"
	],
	[
		"language",
		"river",
		"airport"
	],
	[
		"river",
		"airport",
		"countryOf"
	]
];
function makeQuiz(dest, pool, mastery, rng) {
	const kinds = KINDS_BY_MASTERY[Math.max(0, Math.min(3, Math.floor(mastery)))];
	const kind = kinds[pickIndex(rng, kinds.length)];
	return build(kind, dest, pool, rng);
}
function build(kind, dest, pool, rng) {
	const others = pool.filter((c) => c.iso !== dest.iso);
	switch (kind) {
		case "capital": return choice(kind, dest, `Wat is de hoofdstad van ${dest.nameNl}?`, dest.capital, others.map((c) => c.capital), rng);
		case "language": return choice(kind, dest, `Welke taal spreekt men in ${dest.nameNl}?`, dest.language, others.map((c) => c.language), rng);
		case "river": return choice(kind, dest, `Welke rivier is belangrijk in ${dest.nameNl}?`, dest.river, others.map((c) => c.river), rng);
		case "airport": return choice(kind, dest, `Wat is de belangrijkste luchthavencode van ${dest.capital}?`, dest.airport, others.map((c) => c.airport), rng);
		case "countryOf": return choice(kind, dest, `In welk land ligt ${dest.capital}?`, dest.nameNl, others.map((c) => c.nameNl), rng);
	}
}
function choice(kind, dest, prompt, answer, distractors, rng) {
	const wrong = pickN(rng, [...new Set(distractors.filter((d) => d !== answer))], 2);
	return {
		kind,
		prompt,
		answer,
		options: pickN(rng, [answer, ...wrong], wrong.length + 1),
		destIso: dest.iso
	};
}
var VAN_MAX_SPEED = 28e3;
var PLANE_MAX_SPEED = 11e4;
var VAN_ACCEL = 22e3;
var PLANE_ACCEL = 4e4;
var TURN_RATE = 2.15;
var DRAG = .55;
function maxSpeed(craft) {
	return craft === "plane" ? PLANE_MAX_SPEED : VAN_MAX_SPEED;
}
function accelOf(craft) {
	return craft === "plane" ? PLANE_ACCEL : VAN_ACCEL;
}
function createVehicle(lat, lon, craft = "van") {
	return {
		lat,
		lon,
		heading: 0,
		speed: 0,
		craft
	};
}
function chooseCraft(distanceKm) {
	return distanceKm >= 1800 ? "plane" : "van";
}
function stepVehicle(v, input, dt) {
	const cap = maxSpeed(v.craft);
	const acc = accelOf(v.craft);
	const throttle = clamp(input.throttle, -1, 1);
	const steer = clamp(input.steer, -1, 1);
	let speed = v.speed + throttle * acc * dt;
	speed -= speed * DRAG * dt;
	speed = clamp(speed, -cap * .35, cap);
	const speedFactor = .28 + .72 * Math.min(1, Math.abs(speed) / cap);
	const reverse = speed >= 0 ? 1 : -1;
	const heading = wrapAngle(v.heading - steer * TURN_RATE * speedFactor * reverse * dt);
	const pos = stepLatLon(v.lat, v.lon, heading, speed, dt);
	return {
		...v,
		...pos,
		heading,
		speed
	};
}
function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, n));
}
var SESSION_TRANSITIONS = [
	{
		from: "boot",
		event: "ready",
		to: "hub"
	},
	{
		from: "hub",
		event: "accept",
		to: "brief"
	},
	{
		from: "brief",
		event: "accept",
		to: "transit"
	},
	{
		from: "transit",
		event: "arrive",
		to: "quiz"
	},
	{
		from: "transit",
		event: "abandon",
		to: "hub"
	},
	{
		from: "quiz",
		event: "answer",
		to: "debrief"
	},
	{
		from: "quiz",
		event: "answer",
		to: "quiz"
	},
	{
		from: "debrief",
		event: "continue",
		to: "hub"
	},
	{
		from: [
			"hub",
			"brief",
			"transit",
			"quiz",
			"debrief"
		],
		event: "pause",
		to: "paused"
	},
	{
		from: "paused",
		event: "resume",
		to: "hub"
	}
];
function createSession(seed = 1) {
	const hub = countryByIso("NL");
	return {
		state: "boot",
		resumeState: null,
		vehicle: createVehicle(hub.lat, hub.lon, "van"),
		mission: null,
		quiz: null,
		lastAnswer: null,
		tries: 0,
		mastery: {},
		score: 0,
		streak: 0,
		deliveries: 0,
		seed,
		missionTime: 0,
		fromIso: "NL",
		notice: "Depot Amsterdam. Wacht op dispatch."
	};
}
function stageOf(s) {
	return learnerStage(s.mastery);
}
function destCountry(s) {
	return s.mission ? countryByIso(s.mission.destIso) : null;
}
function reduceSession(s, e) {
	if (e.type === "pause" && s.state !== "paused" && s.state !== "boot") return {
		...s,
		resumeState: s.state,
		state: "paused",
		notice: "Pauze."
	};
	if (e.type === "resume" && s.state === "paused") return {
		...s,
		state: s.resumeState ?? "hub",
		resumeState: null,
		notice: "Verder."
	};
	switch (s.state) {
		case "boot":
			if (e.type === "ready") return dispatch({
				...s,
				state: "hub",
				notice: "Klaar voor de eerste rit."
			});
			return s;
		case "hub":
			if (e.type === "accept") return toBrief(s);
			return s;
		case "brief":
			if (e.type === "accept" && s.mission) return {
				...s,
				state: "transit",
				missionTime: 0,
				notice: `Onderweg naar ${countryByIso(s.mission.destIso).capital}.`
			};
			return s;
		case "transit":
			if (e.type === "abandon") return {
				...s,
				state: "hub",
				mission: null,
				quiz: null,
				streak: 0,
				notice: "Rit geannuleerd."
			};
			if (e.type === "arrive" && s.mission) return toQuiz(s);
			return s;
		case "quiz":
			if (e.type === "answer") return grade(s, e.choice);
			return s;
		case "debrief":
			if (e.type === "continue") return dispatch({
				...s,
				state: "hub"
			});
			return s;
		default: return s;
	}
}
function tickSession(s, input, dt) {
	if (s.state !== "transit" || !s.mission) return s;
	const vehicle = stepVehicle(s.vehicle, input, dt);
	const dest = countryByIso(s.mission.destIso);
	const next = {
		...s,
		vehicle,
		missionTime: s.missionTime + dt
	};
	if (haversineKm(vehicle.lat, vehicle.lon, dest.lat, dest.lon) <= 90) return reduceSession({
		...next,
		vehicle: {
			...vehicle,
			speed: 0
		}
	}, { type: "arrive" });
	return next;
}
function toBrief(s) {
	const dest = pickDestination(s);
	const from = countryByIso(s.fromIso);
	const distanceKm = haversineKm(from.lat, from.lon, dest.lat, dest.lon);
	const craft = chooseCraft(distanceKm);
	return {
		...s,
		state: "brief",
		lastAnswer: null,
		tries: 0,
		quiz: null,
		vehicle: {
			...s.vehicle,
			lat: from.lat,
			lon: from.lon,
			speed: 0,
			heading: s.vehicle.heading,
			craft
		},
		mission: {
			fromIso: from.iso,
			destIso: dest.iso,
			startedAt: s.deliveries,
			distanceKm
		},
		notice: `Pakket naar ${dest.capital}, ${dest.nameNl}.`
	};
}
function toQuiz(s) {
	if (!s.mission) return s;
	const dest = countryByIso(s.mission.destIso);
	const rng = mulberry32(s.seed + s.deliveries * 97 + dest.isoNumeric);
	const quiz = makeQuiz(dest, playableCountries(s.mastery), s.mastery[dest.iso] ?? 0, rng);
	return {
		...s,
		state: "quiz",
		vehicle: {
			...s.vehicle,
			speed: 0,
			lat: dest.lat,
			lon: dest.lon
		},
		quiz,
		tries: 0,
		lastAnswer: null,
		notice: `Aangekomen in ${dest.capital}. Kennischeck.`
	};
}
function grade(s, choice) {
	if (!s.quiz || !s.mission) return s;
	const destIso = s.mission.destIso;
	if (!(choice === s.quiz.answer)) {
		const tries = s.tries + 1;
		if (tries < 2) return {
			...s,
			tries,
			lastAnswer: "wrong",
			streak: 0,
			notice: "Nog een poging."
		};
		return {
			...s,
			state: "debrief",
			tries,
			lastAnswer: "wrong",
			streak: 0,
			fromIso: destIso,
			mission: s.mission,
			notice: `Fout. Het was ${s.quiz.answer}. Pakket is wel afgegeven.`
		};
	}
	const prev = s.mastery[destIso] ?? 0;
	const mastery = {
		...s.mastery,
		[destIso]: Math.min(3, prev + 1)
	};
	const timeBonus = Math.max(0, Math.round(40 - s.missionTime));
	const score = s.score + 100 + timeBonus + s.streak * 10;
	return {
		...s,
		state: "debrief",
		lastAnswer: "correct",
		mastery,
		score,
		streak: s.streak + 1,
		deliveries: s.deliveries + 1,
		fromIso: destIso,
		notice: `Bezorgd. +${100 + timeBonus} punten.`
	};
}
function dispatch(s) {
	const dest = pickDestination(s);
	return {
		...s,
		notice: `Volgende: ${dest.capital}.`
	};
}
function pickDestination(s) {
	const playable = playableCountries(s.mastery).filter((c) => c.iso !== s.fromIso);
	const pool = playable.length ? playable : COUNTRIES.filter((c) => c.iso !== s.fromIso);
	const weak = pool.filter((c) => (s.mastery[c.iso] ?? 0) < 3);
	const use = weak.length ? weak : pool;
	return use[pickIndex(mulberry32(s.seed + s.deliveries * 13 + s.fromIso.charCodeAt(0)), use.length)];
}
function progressInRegion(s) {
	const region = highestUnlockedRegion(s.mastery);
	const members = COUNTRIES.filter((c) => c.region === region);
	return {
		have: members.filter((c) => (s.mastery[c.iso] ?? 0) >= 2).length,
		total: members.length
	};
}
//#endregion
export { haversineKm as a, stageOf as c, destCountry as i, tickSession as l, bearingDeg as n, progressInRegion as o, createSession as r, reduceSession as s, SESSION_TRANSITIONS as t };
