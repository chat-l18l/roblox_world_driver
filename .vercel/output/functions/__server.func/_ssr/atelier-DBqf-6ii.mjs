import { t as SESSION_TRANSITIONS } from "./session-CRvRAKAG.mjs";
import { R as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/atelier-DBqf-6ii.js
var import_jsx_runtime = require_jsx_runtime();
function Atelier() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-3xl px-4 py-10 sm:py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-muted",
				children: "bouwplan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl",
				children: "Van C-discipline naar Roblox, zonder Studio-chaos."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg text-muted",
				children: "Roblox is geen C++-engine, maar je mag hem wel zo behandelen: platte data, expliciete state machines, server als firmware, client als HMI, Git als waarheid. Dit atelier is het plan; de rit onder Speel is slice 1 van dezelfde architectuur."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "01",
				title: "Wat hier kan — en wat niet",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Roblox Studio draait op Windows/macOS en praat met Roblox-servers. In deze preview kan ik geen .rbxl openen, geen Rojo-plugin aankoppelen, en geen Luau in de Roblox-VM draaien. Wat wél kan: de gameplay valideren, de FSM-contracten vastleggen, de leerlijn vullen, en unit tests schrijven die later 1-op-1 naar Jest-Lua of Lune verhuizen." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Behandel dit webprototype als de first-article inspection van je firmware: als de reducer hier klopt, port hij. Als de pedagogie hier niet werkt, lost 3D-avatars dat niet op." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "02",
				title: "Toolchain (2026)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Zonder Rojo is Git vijandig: Studio slaat een binair place-file op. Met Rojo zijn scripts gewone bestanden. Dat is de enige serieuze weg." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Rokit",
								children: "toolchain-manager, analogie: rustup / asdf."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Rojo",
								children: "filesystem ↔ DataModel. Analogie: rsync + compile-stap."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Wally",
								children: "packages. Analogie: vcpkg, geen npm-mentaliteit in runtime."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Selene",
								children: "linter. Analogie: clang-tidy."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "StyLua",
								children: "formatter. Analogie: clang-format. Geen smaakdiscussies."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Luau LSP",
								children: "types in de editor. Luau heeft een typesysteem; gebruik het."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Jest-Lua of TestEZ",
								children: "unit tests. Roblox zelf is naar Jest-Lua gegaan."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Lune",
								children: "Luau buiten Studio, voor CI-scripts."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "VS Code of Neovim",
								children: "Studio is niet je editor."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3",
						children: "Optioneel later: roblox-ts (TypeScript → Luau). Start er niet mee. Native typed Luau is dichter bij C-structuren en debugt zonder sourcemap-laag."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "03",
				title: "Git-workflow",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Source of truth is de repo, nooit het geopende place in Studio." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, { children: `wereldpost/
  default.project.json      # Rojo: map → DataModel
  wally.toml
  selene.toml
  stylua.toml
  rokit.toml
  aftman.toml               # legacy; liever Rokit
  src/
    shared/                 # ReplicatedStorage
    server/                 # ServerScriptService
    client/                 # StarterPlayerScripts
    test/                   # niet in productie-place
  assets/                   # alleen wat niet in Studio moet
  .github/workflows/ci.yml` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Niet committen",
								children: "Studio cache, Thumbs.db, sourcemap.json als hij gegenereerd wordt, Wally Packages/ (installeer in CI), .rbxl als bron."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Wél",
								children: "Luau, project.json, lockfile van Wally, testdata, CI."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Li, {
								k: "Build artifact",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono text-[0.9em]",
									children: "rojo build -o dist/game.rbxlx"
								}), " in CI, zoals je een ELF bouwt. Het place-file is output, geen bron."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Twee-weg sync",
								children: "Gevaarlijk. Scripts alleen op disk editen. Lighting, terrain, instance-hierarchie mag in Studio, maar documenteer wat de disk overschrijft."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Branches",
								children: "feature/rit-fsm, nooit direct op main in Studio knoeien."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3",
						children: "Rojo kan Git uitstekend aan. Het omgekeerde — Git op een .rbxl — kan dat niet. Diffs op binary places zijn waardeloos."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "04",
				title: "Drie lagen, zoals firmware",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Jouw scheiding modelling / gedrag / logica is precies goed. Noem ze zo:" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-3 list-decimal space-y-2 pl-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Model" }),
								" — POD. Landen, feiten, curriculum, protocolberichten. Geen instances, geen side effects. In C: structs + lookup tables. Hier:",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono text-[0.9em]",
									children: " src/model/"
								}),
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Gedrag" }),
								" — state machines als pure reducers.",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono text-[0.9em]",
									children: "reduce(state, event) → state"
								}),
								". Geen timers in de machine, tijd is een event of een tick-parameter. Hier:",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono text-[0.9em]",
									children: " src/sim/"
								}),
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "View" }),
								" — dom. Tekent de state, stuurt input als events. Mag schudden, particles, geluid — nooit mastery of score muteren. Hier:",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono text-[0.9em]",
									children: " src/game/"
								}),
								"."
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3",
						children: [
							"In Roblox: Model + Sim in ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "ReplicatedStorage.Shared" }),
							" (of alleen server als de client het niet nodig heeft). Server is autoriteit. Client voorspelt voertuig lokaal, server bevestigt aankomst en quiz."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Analogie embedded: MCU bezit de state. Display-firmware mag interpoleren. Cheaten op de client is hetzelfde als een HMI die doet alsof de klep open is — de PLC gelooft het niet." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "05",
				title: "State machines, geen vlaggenbos",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Geen ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-[0.9em]",
							children: "isDriving && !isPaused && hasPackage"
						}),
						". Eén enum, één reducer, illegale events zijn no-ops. Nested machines (voertuig idle/cruise) alleen als het echt helpt; start met één sessie-machine."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-4 space-y-1 font-mono text-sm",
						children: SESSION_TRANSITIONS.filter((t, i, a) => a.findIndex((x) => x.event === t.event && x.to === t.to && JSON.stringify(x.from) === JSON.stringify(t.from)) === i).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							Array.isArray(t.from) ? t.from.join("|") : t.from,
							" —",
							t.event,
							"→ ",
							t.to
						] }, `${JSON.stringify(t.from)}-${t.event}-${t.to}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4",
						children: "Voertuig is géén FSM, het is integratie: heading, speed, lat/lon. Tick met vaste dt (1/60), cap op 0.1s. Precies zoals je een control loop schrijft."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A = links is een contract, geen implementatiedetail. In deze 2D noord-omhoog kaart: heading 0 is noord, A verlaagt heading (tegen de klok, neus naar west). In een 3D chase-cam in Roblox gebruik je de basis uit je engine — maar de speler ziet A = links. Test dat, niet de variabele." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "06",
				title: "Testbaarheid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Regel: alles wat je wilt testen, importeert geen Roblox-instance en geen DOM." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Unit",
								children: "quiz-generatie, mastery-unlock, reducer-overgangen, haversine, voertuigteken. Draait in Node nu; later in Lune/Jest-Lua."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Contract",
								children: "elke RemoteEvent heeft een zod-achtig type (in Luau: een validator). Onbekende payloads droppen."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "Integratie",
								children: "één pad in Studio: spawn, pakket, aankomst, quiz. Niet 200 klikpaden."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
								k: "CI",
								children: "selene + stylua --check + unit tests bij elke PR. Place-build mag nightly."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3",
						children: "De tests onder de sim-laag van dit prototype zijn het voorbeeld. Port de asserts, niet de runner."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chapter, {
				n: "07",
				title: "Incrementele slices",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-1 list-decimal space-y-3 pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 0 — repo." }), " Rojo hello-world, GitHub, CI die Selene draait. Geen gameplay. Stop hier tot serve → Studio groen is."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 1 — bewegen." }), " Eén part, WASD, server-authoritative positie of eenvoudige client-predict. Klaar als A links is."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 2 — één pakket." }), " Amsterdam → Brussel, marker, overlap = aankomst. Geen quiz."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 3 — quiz-FSM." }), " Zelfde reducer als hier. Data in een ModuleScript, geen strings in GUI."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 4 — kaart." }), " In Roblox: of een 3D-hub-wereld per regio, of een 2D-kaartpart (ViewportFrame) plus 3D depot. De webkaart is de waarheid van posities; 3D is theater."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 5 — mastery." }), " Labels dimmen, schillen unlocken."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Slice 6 — juice & meta." }), " Stempel-SFX, streaks, ouder-dashboard (optioneel, accounts pas als je dat echt wilt)."] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3",
					children: "Niet parallel bouwen tot slice 0-3 staan. 3D-wereld te vroeg is de klassieke Roblox-val: je modelleert Parijs voordat de rit-state klopt."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chapter, {
				n: "08",
				title: "Roblox-specifiek voor embedded-mensen",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "Replication",
							children: "Filtering is altijd aan. Client mag geen score zetten."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "Instances",
							children: "scene graph, geen je objectmodel. Logic in ModuleScripts, niet in de staart van een Part."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "RemoteEvent",
							children: "IPC. Typ ze. Rate-limit. Vertrouw niets."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "Heartbeat vs Stepped",
							children: "jouw control loop. Vaste timestep zelf doen als het ertoe doet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "GC",
							children: "geen RAII. Vergeet connections niet te Disconnecten. Dat is je leak."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "Types",
							children: "--!strict bovenaan elk bestand. Geen untyped tables als je een struct bedoelt."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Li, {
							k: "DataStore",
							children: "later, voor mastery over devices. Nu local/session. DataStore is geen database; ontwerp eromheen."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chapter, {
				n: "09",
				title: "Porttabel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-4 font-medium",
								children: "Hier (web)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Roblox"
							})]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: PORT.map(([a, b]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/70 align-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-4 font-mono text-[13px]",
								children: a
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 font-mono text-[13px]",
								children: b
							})]
						}, a)) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chapter, {
				n: "10",
				title: "Volgende concrete stap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Als de rit hier goed voelt: lokaal een repo ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "wereldpost-rbx" }),
					" met Rokit + Rojo, dit model en deze reducer overschrijven naar typed Luau, CI op groen, dan pas Studio openen. De leerlijn-pagina is de backlog van content, niet van engine-features."
				] })
			})
		]
	});
}
function Chapter({ n, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-subtle",
				children: n
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-2xl tracking-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-3 text-[17px] leading-relaxed text-fg/90",
				children
			})
		]
	});
}
function Li({ k, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-medium",
			children: [k, "."]
		}),
		" ",
		children
	] });
}
function Code({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface p-4 font-mono text-xs leading-relaxed",
		children
	});
}
var PORT = [
	["src/model/countries.ts", "ReplicatedStorage.Shared.Model.Countries"],
	["src/model/curriculum.ts", "ReplicatedStorage.Shared.Model.Curriculum"],
	["src/sim/session.ts", "ServerScriptService.Server.Session (autoriteit)"],
	["src/sim/vehicle.ts", "Shared.Sim.Vehicle + server reconcile"],
	["src/sim/quiz.ts", "Server.Quiz — client krijgt alleen prompt+options"],
	["src/game/GameScreen.tsx", "StarterPlayerScripts.Client.Hud + MapView"],
	["src/game/input.ts", "Client.Input — RemoteEvent DriveInput"],
	["src/sim/save.ts", "DataStore later; nu session attribute"],
	["node:test", "Jest-Lua / Lune"]
];
//#endregion
export { Atelier as component };
