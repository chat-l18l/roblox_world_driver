import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SESSION_TRANSITIONS } from "@/sim/session.ts";

export const Route = createFileRoute("/atelier")({ component: Atelier });

function Atelier() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">bouwplan</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Van C-discipline naar Roblox, zonder Studio-chaos.
      </h1>
      <p className="mt-4 text-lg text-muted">
        Roblox is geen C++-engine, maar je mag hem wel zo behandelen: platte data,
        expliciete state machines, server als firmware, client als HMI, Git als
        waarheid. Dit atelier is het plan; de rit onder Speel is slice 1 van dezelfde
        architectuur.
      </p>

      <Chapter n="01" title="Wat hier kan — en wat niet">
        <p>
          Roblox Studio draait op Windows/macOS en praat met Roblox-servers. In deze
          preview kan ik geen .rbxl openen, geen Rojo-plugin aankoppelen, en geen
          Luau in de Roblox-VM draaien. Wat wél kan: de gameplay valideren, de
          FSM-contracten vastleggen, de leerlijn vullen, en unit tests schrijven die
          later 1-op-1 naar Jest-Lua of Lune verhuizen.
        </p>
        <p>
          Behandel dit webprototype als de first-article inspection van je firmware:
          als de reducer hier klopt, port hij. Als de pedagogie hier niet werkt, lost
          3D-avatars dat niet op.
        </p>
      </Chapter>

      <Chapter n="02" title="Toolchain (2026)">
        <p>
          Zonder Rojo is Git vijandig: Studio slaat een binair place-file op. Met Rojo
          zijn scripts gewone bestanden. Dat is de enige serieuze weg.
        </p>
        <ul className="mt-3 space-y-2">
          <Li k="Rokit">toolchain-manager, analogie: rustup / asdf.</Li>
          <Li k="Rojo">filesystem ↔ DataModel. Analogie: rsync + compile-stap.</Li>
          <Li k="Wally">packages. Analogie: vcpkg, geen npm-mentaliteit in runtime.</Li>
          <Li k="Selene">linter. Analogie: clang-tidy.</Li>
          <Li k="StyLua">formatter. Analogie: clang-format. Geen smaakdiscussies.</Li>
          <Li k="Luau LSP">types in de editor. Luau heeft een typesysteem; gebruik het.</Li>
          <Li k="Jest-Lua of TestEZ">unit tests. Roblox zelf is naar Jest-Lua gegaan.</Li>
          <Li k="Lune">Luau buiten Studio, voor CI-scripts.</Li>
          <Li k="VS Code of Neovim">Studio is niet je editor.</Li>
        </ul>
        <p className="mt-3">
          Optioneel later: roblox-ts (TypeScript → Luau). Start er niet mee. Native
          typed Luau is dichter bij C-structuren en debugt zonder sourcemap-laag.
        </p>
      </Chapter>

      <Chapter n="03" title="Git-workflow">
        <p>Source of truth is de repo, nooit het geopende place in Studio.</p>
        <Code>{`wereldpost/
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
  .github/workflows/ci.yml`}</Code>
        <ul className="mt-3 space-y-2">
          <Li k="Niet committen">Studio cache, Thumbs.db, sourcemap.json als hij gegenereerd wordt, Wally Packages/ (installeer in CI), .rbxl als bron.</Li>
          <Li k="Wél">Luau, project.json, lockfile van Wally, testdata, CI.</Li>
          <Li k="Build artifact">
            <code className="font-mono text-[0.9em]">rojo build -o dist/game.rbxlx</code> in CI, zoals je een ELF bouwt. Het place-file is output, geen bron.
          </Li>
          <Li k="Twee-weg sync">Gevaarlijk. Scripts alleen op disk editen. Lighting, terrain, instance-hierarchie mag in Studio, maar documenteer wat de disk overschrijft.</Li>
          <Li k="Branches">feature/rit-fsm, nooit direct op main in Studio knoeien.</Li>
        </ul>
        <p className="mt-3">
          Rojo kan Git uitstekend aan. Het omgekeerde — Git op een .rbxl — kan dat
          niet. Diffs op binary places zijn waardeloos.
        </p>
      </Chapter>

      <Chapter n="04" title="Drie lagen, zoals firmware">
        <p>Jouw scheiding modelling / gedrag / logica is precies goed. Noem ze zo:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            <strong>Model</strong> — POD. Landen, feiten, curriculum, protocolberichten.
            Geen instances, geen side effects. In C: structs + lookup tables. Hier:
            <code className="font-mono text-[0.9em]"> src/model/</code>.
          </li>
          <li>
            <strong>Gedrag</strong> — state machines als pure reducers.
            <code className="font-mono text-[0.9em]">reduce(state, event) → state</code>.
            Geen timers in de machine, tijd is een event of een tick-parameter. Hier:
            <code className="font-mono text-[0.9em]"> src/sim/</code>.
          </li>
          <li>
            <strong>View</strong> — dom. Tekent de state, stuurt input als events.
            Mag schudden, particles, geluid — nooit mastery of score muteren. Hier:
            <code className="font-mono text-[0.9em]"> src/game/</code>.
          </li>
        </ol>
        <p className="mt-3">
          In Roblox: Model + Sim in <em>ReplicatedStorage.Shared</em> (of alleen server
          als de client het niet nodig heeft). Server is autoriteit. Client voorspelt
          voertuig lokaal, server bevestigt aankomst en quiz.
        </p>
        <p>
          Analogie embedded: MCU bezit de state. Display-firmware mag interpoleren.
          Cheaten op de client is hetzelfde als een HMI die doet alsof de klep open
          is — de PLC gelooft het niet.
        </p>
      </Chapter>

      <Chapter n="05" title="State machines, geen vlaggenbos">
        <p>
          Geen <code className="font-mono text-[0.9em]">isDriving && !isPaused && hasPackage</code>.
          Eén enum, één reducer, illegale events zijn no-ops. Nested machines (voertuig
          idle/cruise) alleen als het echt helpt; start met één sessie-machine.
        </p>
        <ol className="mt-4 space-y-1 font-mono text-sm">
          {SESSION_TRANSITIONS.filter(
            (t, i, a) =>
              a.findIndex(
                (x) =>
                  x.event === t.event &&
                  x.to === t.to &&
                  JSON.stringify(x.from) === JSON.stringify(t.from),
              ) === i,
          ).map((t) => (
            <li key={`${JSON.stringify(t.from)}-${t.event}-${t.to}`}>
              {Array.isArray(t.from) ? t.from.join("|") : t.from} —{t.event}→ {t.to}
            </li>
          ))}
        </ol>
        <p className="mt-4">
          Voertuig is géén FSM, het is integratie: heading, speed, lat/lon. Tick met
          vaste dt (1/60), cap op 0.1s. Precies zoals je een control loop schrijft.
        </p>
        <p>
          A = links is een contract, geen implementatiedetail. In deze 2D noord-omhoog
          kaart: heading 0 is noord, A verlaagt heading (tegen de klok, neus naar west).
          In een 3D chase-cam in Roblox gebruik je de basis uit je engine — maar de
          speler ziet A = links. Test dat, niet de variabele.
        </p>
      </Chapter>

      <Chapter n="06" title="Testbaarheid">
        <p>Regel: alles wat je wilt testen, importeert geen Roblox-instance en geen DOM.</p>
        <ul className="mt-3 space-y-2">
          <Li k="Unit">quiz-generatie, mastery-unlock, reducer-overgangen, haversine, voertuigteken. Draait in Node nu; later in Lune/Jest-Lua.</Li>
          <Li k="Contract">elke RemoteEvent heeft een zod-achtig type (in Luau: een validator). Onbekende payloads droppen.</Li>
          <Li k="Integratie">één pad in Studio: spawn, pakket, aankomst, quiz. Niet 200 klikpaden.</Li>
          <Li k="CI">selene + stylua --check + unit tests bij elke PR. Place-build mag nightly.</Li>
        </ul>
        <p className="mt-3">
          De tests onder de sim-laag van dit prototype zijn het voorbeeld. Port de
          asserts, niet de runner.
        </p>
      </Chapter>

      <Chapter n="07" title="Incrementele slices">
        <ol className="mt-1 list-decimal space-y-3 pl-5">
          <li>
            <strong>Slice 0 — repo.</strong> Rojo hello-world, GitHub, CI die Selene draait.
            Geen gameplay. Stop hier tot serve → Studio groen is.
          </li>
          <li>
            <strong>Slice 1 — bewegen.</strong> Eén part, WASD, server-authoritative
            positie of eenvoudige client-predict. Klaar als A links is.
          </li>
          <li>
            <strong>Slice 2 — één pakket.</strong> Amsterdam → Brussel, marker, overlap =
            aankomst. Geen quiz.
          </li>
          <li>
            <strong>Slice 3 — quiz-FSM.</strong> Zelfde reducer als hier. Data in een
            ModuleScript, geen strings in GUI.
          </li>
          <li>
            <strong>Slice 4 — kaart.</strong> In Roblox: of een 3D-hub-wereld per
            regio, of een 2D-kaartpart (ViewportFrame) plus 3D depot. De webkaart is
            de waarheid van posities; 3D is theater.
          </li>
          <li>
            <strong>Slice 5 — mastery.</strong> Labels dimmen, schillen unlocken.
          </li>
          <li>
            <strong>Slice 6 — juice & meta.</strong> Stempel-SFX, streaks, ouder-dashboard
            (optioneel, accounts pas als je dat echt wilt).
          </li>
        </ol>
        <p className="mt-3">
          Niet parallel bouwen tot slice 0-3 staan. 3D-wereld te vroeg is de klassieke
          Roblox-val: je modelleert Parijs voordat de rit-state klopt.
        </p>
      </Chapter>

      <Chapter n="08" title="Roblox-specifiek voor embedded-mensen">
        <ul className="space-y-2">
          <Li k="Replication">Filtering is altijd aan. Client mag geen score zetten.</Li>
          <Li k="Instances">scene graph, geen je objectmodel. Logic in ModuleScripts, niet in de staart van een Part.</Li>
          <Li k="RemoteEvent">IPC. Typ ze. Rate-limit. Vertrouw niets.</Li>
          <Li k="Heartbeat vs Stepped">jouw control loop. Vaste timestep zelf doen als het ertoe doet.</Li>
          <Li k="GC">geen RAII. Vergeet connections niet te Disconnecten. Dat is je leak.</Li>
          <Li k="Types">--!strict bovenaan elk bestand. Geen untyped tables als je een struct bedoelt.</Li>
          <Li k="DataStore">later, voor mastery over devices. Nu local/session. DataStore is geen database; ontwerp eromheen.</Li>
        </ul>
      </Chapter>

      <Chapter n="09" title="Porttabel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Hier (web)</th>
                <th className="py-2 font-medium">Roblox</th>
              </tr>
            </thead>
            <tbody>
              {PORT.map(([a, b]) => (
                <tr key={a} className="border-b border-border/70 align-top">
                  <td className="py-2 pr-4 font-mono text-[13px]">{a}</td>
                  <td className="py-2 font-mono text-[13px]">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Chapter>

      <Chapter n="10" title="Volgende concrete stap">
        <p>
          Als de rit hier goed voelt: lokaal een repo <em>wereldpost-rbx</em> met Rokit
          + Rojo, dit model en deze reducer overschrijven naar typed Luau, CI op groen,
          dan pas Studio openen. De leerlijn-pagina is de backlog van content, niet van
          engine-features.
        </p>
      </Chapter>
    </main>
  );
}

function Chapter({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14">
      <p className="font-mono text-xs text-subtle">{n}</p>
      <h2 className="mt-1 font-display text-2xl tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[17px] leading-relaxed text-fg/90">{children}</div>
    </section>
  );
}

function Li({ k, children }: { k: string; children: ReactNode }) {
  return (
    <li>
      <span className="font-medium">{k}.</span> {children}
    </li>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface p-4 font-mono text-xs leading-relaxed">
      {children}
    </pre>
  );
}

const PORT: [string, string][] = [
  ["src/model/countries.ts", "ReplicatedStorage.Shared.Model.Countries"],
  ["src/model/curriculum.ts", "ReplicatedStorage.Shared.Model.Curriculum"],
  ["src/sim/session.ts", "ServerScriptService.Server.Session (autoriteit)"],
  ["src/sim/vehicle.ts", "Shared.Sim.Vehicle + server reconcile"],
  ["src/sim/quiz.ts", "Server.Quiz — client krijgt alleen prompt+options"],
  ["src/game/GameScreen.tsx", "StarterPlayerScripts.Client.Hud + MapView"],
  ["src/game/input.ts", "Client.Input — RemoteEvent DriveInput"],
  ["src/sim/save.ts", "DataStore later; nu session attribute"],
  ["node:test", "Jest-Lua / Lune"],
];
