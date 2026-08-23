import { t as SESSION_TRANSITIONS } from "./session-CRvRAKAG.mjs";
import { R as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Boxes, r as GitBranch, s as ArrowRight, t as Truck } from "../_libs/lucide-react.mjs";
import { n as CardDesc, r as CardTitle, t as Card } from "./card-B5xgsoyS.mjs";
import { t as Button } from "./button-DjqkBGXG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BvR166i7.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 py-10 sm:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "atelier · slice 0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 max-w-3xl font-display text-5xl font-medium tracking-tight sm:text-6xl",
				children: "Leer de wereld kennen als koerier."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 max-w-2xl text-lg text-muted",
				children: "Wereldpost is een educatieve game: skill (snel op bestemming) plus kennis (landen, hoofdsteden, talen, rivieren, luchthavens). Dit is de speelbare architectuur — dezelfde state machines, testdata en leerlijn die later naar Roblox/Luau gaan."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/speel",
						children: ["Rij de eerste rit", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/atelier",
						children: "Bouwplan & Git/Rojo"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-14 grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, {
							className: "size-5 text-accent",
							strokeWidth: 1.75
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-4",
							children: "Gameplay"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDesc, { children: "Pakket van stad naar stad. Noord-omhoog kaart, WASD, kennischeck bij aankomst. Labels verdwijnen naarmate je landen beheerst." })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, {
							className: "size-5 text-accent",
							strokeWidth: 1.75
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-4",
							children: "Drie lagen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDesc, { children: "Model (data), gedrag (expliciete FSM-reducers), view (canvas). Geen logica in de renderer. Zo test je zonder Studio of browser." })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, {
							className: "size-5 text-accent",
							strokeWidth: 1.75
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "mt-4",
							children: "Git is de waarheid"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDesc, { children: "Roblox Studio is de debugger en layout-tool, niet de source of truth. Rojo synct Luau-bestanden; Git doet versiebeheer, review en CI." })
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Sessie-machine"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-muted",
						children: "Eén reducer, platte struct, verboden overgangen zijn no-ops. In Roblox wordt dit dezelfde tabel in een ModuleScript op de server."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-6 grid gap-2 font-mono text-sm sm:grid-cols-2",
						children: uniqueFlow().map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2",
							children: row
						}, row))
					})
				]
			})
		]
	});
}
function uniqueFlow() {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const t of SESSION_TRANSITIONS) {
		const line = `${Array.isArray(t.from) ? t.from.join("|") : t.from}  —${t.event}→  ${t.to}`;
		if (seen.has(line)) continue;
		seen.add(line);
		out.push(line);
	}
	return out;
}
//#endregion
export { Home as component };
