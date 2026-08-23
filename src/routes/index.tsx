import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, GitBranch, Truck } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardDesc, CardTitle } from "@/components/ui/card.tsx";
import { SESSION_TRANSITIONS } from "@/sim/session.ts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">atelier · slice 0</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium tracking-tight sm:text-6xl">
        Leer de wereld kennen als koerier.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Wereldpost is een educatieve game: skill (snel op bestemming) plus kennis
        (landen, hoofdsteden, talen, rivieren, luchthavens). Dit is de speelbare
        architectuur — dezelfde state machines, testdata en leerlijn die later naar
        Roblox/Luau gaan.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/speel">
            Rij de eerste rit
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/atelier">Bouwplan & Git/Rojo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/werkstroom">Werk-pc / Rojo</Link>
        </Button>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        <Card>
          <Truck className="size-5 text-accent" strokeWidth={1.75} />
          <CardTitle className="mt-4">Gameplay</CardTitle>
          <CardDesc>
            Pakket van stad naar stad. Noord-omhoog kaart, WASD, kennischeck bij aankomst.
            Labels verdwijnen naarmate je landen beheerst.
          </CardDesc>
        </Card>
        <Card>
          <Boxes className="size-5 text-accent" strokeWidth={1.75} />
          <CardTitle className="mt-4">Drie lagen</CardTitle>
          <CardDesc>
            Model (data), gedrag (expliciete FSM-reducers), view (canvas). Geen logica in de
            renderer. Zo test je zonder Studio of browser.
          </CardDesc>
        </Card>
        <Card>
          <GitBranch className="size-5 text-accent" strokeWidth={1.75} />
          <CardTitle className="mt-4">Git is de waarheid</CardTitle>
          <CardDesc>
            Roblox Studio is de debugger en layout-tool, niet de source of truth. Rojo
            synct Luau-bestanden; Git doet versiebeheer, review en CI.
          </CardDesc>
        </Card>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl">Sessie-machine</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Eén reducer, platte struct, verboden overgangen zijn no-ops. In Roblox wordt dit
          dezelfde tabel in een ModuleScript op de server.
        </p>
        <ol className="mt-6 grid gap-2 font-mono text-sm sm:grid-cols-2">
          {uniqueFlow().map((row) => (
            <li
              key={row}
              className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2"
            >
              {row}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function uniqueFlow(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of SESSION_TRANSITIONS) {
    const from = Array.isArray(t.from) ? t.from.join("|") : t.from;
    const line = `${from}  —${t.event}→  ${t.to}`;
    if (seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out;
}
