import { a as REGION_ORDER, c as UNLOCK_RATIO, i as REGION_LABEL, r as REGION_BLURB, t as COUNTRIES } from "./curriculum-BNjmyCpA.mjs";
import { R as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CardDesc, r as CardTitle, t as Card } from "./card-B5xgsoyS.mjs";
import { n as FlagBars, t as Badge } from "./badge-B2TDrlcD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leerlijn-DSPM7cfk.js
var import_jsx_runtime = require_jsx_runtime();
function Leerlijn() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 py-10 sm:py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "curriculum"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 max-w-3xl font-display text-4xl font-medium tracking-tight sm:text-5xl",
				children: "Skill plus kennis, in schillen."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-lg text-muted",
				children: "Retrieval practice bij aankomst, spacing doordat ritten teruggaan naar zwakke landen, fading guidance doordat labels verdwijnen. Geen quiz-app met een busje erop — de geografie is de baan."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Wat je leert" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDesc, { children: "Ligging (waar ligt het land), hoofdstad, voertaal, kenmerkende rivier, IATA-code van de hoofd luchthaven. Relatieve afstand en koers komen gratis mee omdat je er naartoe rijdt." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Hoe het blijft hangen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDesc, { children: [
					"Productie (zelf antwoorden, geen multiple-choice-voor-altijd), immediate feedback, mastery 0–3 per land, unlock pas bij ",
					Math.round(UNLOCK_RATIO * 100),
					"% van de schil op niveau 2. Fouten resetten de reeks, niet de kennis."
				] })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-12 space-y-10",
				children: REGION_ORDER.map((id, i) => {
					const members = COUNTRIES.filter((c) => c.region === id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-subtle",
								children: ["schil ", i]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl tracking-tight",
								children: REGION_LABEL[id]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xl text-muted",
								children: REGION_BLURB[id]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [members.length, " bestemmingen"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
						children: members.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagBars, {
								country: c,
								className: "mt-0.5 h-6 w-9 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate font-medium leading-tight",
									children: [c.nameNl, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: [" · ", c.capital]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: [
										c.language,
										" · ",
										c.river,
										" · ",
										c.airport
									]
								})]
							})]
						}, c.iso))
					})] }, id);
				})
			})
		]
	});
}
//#endregion
export { Leerlijn as component };
