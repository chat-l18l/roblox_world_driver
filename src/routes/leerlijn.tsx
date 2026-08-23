import { createFileRoute } from "@tanstack/react-router";
import { COUNTRIES } from "@/model/countries.ts";
import {
  REGION_BLURB,
  REGION_LABEL,
  REGION_ORDER,
  UNLOCK_RATIO,
} from "@/model/curriculum.ts";
import { FlagBars } from "@/components/FlagBars.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardDesc, CardTitle } from "@/components/ui/card.tsx";

export const Route = createFileRoute("/leerlijn")({ component: Leerlijn });

function Leerlijn() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">curriculum</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Skill plus kennis, in schillen.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Retrieval practice bij aankomst, spacing doordat ritten teruggaan naar zwakke
        landen, fading guidance doordat labels verdwijnen. Geen quiz-app met een
        busje erop — de geografie is de baan.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Wat je leert</CardTitle>
          <CardDesc>
            Ligging (waar ligt het land), hoofdstad, voertaal, kenmerkende rivier,
            IATA-code van de hoofd luchthaven. Relatieve afstand en koers komen gratis
            mee omdat je er naartoe rijdt.
          </CardDesc>
        </Card>
        <Card>
          <CardTitle>Hoe het blijft hangen</CardTitle>
          <CardDesc>
            Productie (zelf antwoorden, geen multiple-choice-voor-altijd), immediate
            feedback, mastery 0–3 per land, unlock pas bij {Math.round(UNLOCK_RATIO * 100)}%
            van de schil op niveau 2. Fouten resetten de reeks, niet de kennis.
          </CardDesc>
        </Card>
      </div>

      <ol className="mt-12 space-y-10">
        {REGION_ORDER.map((id, i) => {
          const members = COUNTRIES.filter((c) => c.region === id);
          return (
            <li key={id}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-subtle">schil {i}</p>
                  <h2 className="font-display text-2xl tracking-tight">{REGION_LABEL[id]}</h2>
                  <p className="mt-1 max-w-xl text-muted">{REGION_BLURB[id]}</p>
                </div>
                <Badge variant="outline">{members.length} bestemmingen</Badge>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((c) => (
                  <li
                    key={c.iso}
                    className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-3"
                  >
                    <FlagBars country={c} className="mt-0.5 h-6 w-9 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium leading-tight">
                        {c.nameNl}
                        <span className="text-muted"> · {c.capital}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {c.language} · {c.river} · {c.airport}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
