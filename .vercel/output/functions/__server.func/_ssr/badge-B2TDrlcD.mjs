import { R as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-DCxWqQFY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-B2TDrlcD.js
var import_jsx_runtime = require_jsx_runtime();
function FlagBars({ country, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex overflow-hidden rounded-[var(--radius-xs)] border border-border", country.flagDir === "v" ? "flex-row" : "flex-col", className ?? "h-4 w-6"),
		"aria-hidden": true,
		children: country.flag.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-h-0 min-w-0 flex-1",
			style: { background: c }
		}, i))
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-surface-2 text-fg",
		accent: "bg-accent text-accent-fg",
		stamp: "bg-stamp text-stamp-fg",
		outline: "border border-border text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({
			variant,
			className
		})),
		...props
	});
}
//#endregion
export { FlagBars as n, Badge as t };
