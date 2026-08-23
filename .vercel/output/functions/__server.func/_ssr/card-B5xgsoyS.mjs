import { R as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./router-DCxWqQFY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-B5xgsoyS.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-[var(--radius-xl)] border border-border bg-surface p-6 text-fg", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: cn("font-display text-xl font-medium tracking-tight", className),
		...props
	});
}
function CardDesc({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("mt-2 text-sm text-muted", className),
		...props
	});
}
//#endregion
export { CardDesc as n, CardTitle as r, Card as t };
