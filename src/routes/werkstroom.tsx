import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardDesc, CardTitle } from "@/components/ui/card.tsx";

export const Route = createFileRoute("/werkstroom")({ component: Werkstroom });

function Werkstroom() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">werkstroom</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Twee machines, één repo. Roblox draait bij jou.
      </h1>
      <p className="mt-4 text-lg text-muted">
        Deze preview is de testbank voor logica, leerlijn en feel. Roblox Studio
        draait op je werk-pc. GitHub is de bus ertussen. Je hoeft vanaf hier niets
        naar Roblox te “deployen”.
      </p>

      <div className="mt-8 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        <pre className="font-mono text-xs leading-relaxed text-fg sm:text-sm">{`chat  →  src/model + src/sim     (TypeScript, unit tests)
                 ↓  zelfde contract
werk-pc  →  rbx/src               (Luau, Rojo → Studio Play)
                 ↓  als de rit klopt
Studio   →  File → Publish        (Roblox, kinderen)`}</pre>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Wat je op GitHub ziet</h2>
        <p className="mt-3 text-[17px] leading-relaxed">
          Repo:{" "}
          <a
            className="text-accent underline-offset-2 hover:underline"
            href="https://github.com/chat-l18l/roblox_world_driver"
          >
            chat-l18l/roblox_world_driver
          </a>
          . Daar zit ook platform-scaffold (auth-stubs, build-output). Dat is niet de
          game. De game is klein:
        </p>
        <ul className="mt-4 space-y-2 text-[17px]">
          <li>
            <span className="font-mono text-sm">src/model/</span> — landen, feiten,
            schillen. Data, geen gedrag.
          </li>
          <li>
            <span className="font-mono text-sm">src/sim/</span> — sessie-FSM, voertuig,
            quiz. Pure reducers, unit tests.
          </li>
          <li>
            <span className="font-mono text-sm">src/game/</span> — canvas, input, HUD.
            Domme view.
          </li>
          <li>
            <span className="font-mono text-sm">rbx/</span> — Rojo-project. Dit trek je
            op de pc de Studio in.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Wie doet wat</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <CardTitle className="text-lg">Hier in de chat</CardTitle>
            <CardDesc>
              Logica, curriculum, FSM-contract, web-feel, unit tests. Als de reducer
              hier stuk is, port hij niet. Graphics in Roblox-stijl bouwen we niet
              eerst hier — de kaart is een simulator, geen asset-pipeline.
            </CardDesc>
          </Card>
          <Card className="p-5">
            <CardTitle className="text-lg">Jouw werk-pc</CardTitle>
            <CardDesc>
              git pull, Rojo serve, Studio Play. 3D-depot, lighting, personage,
              UI-frames, publiceren naar Roblox. Eén keer toolchain (Rokit + plugin),
              daarna is het pull + serve + Play.
            </CardDesc>
          </Card>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Eerste keer op de pc</h2>
        <p className="mt-3 text-[17px] leading-relaxed">
          Eenmalig: Roblox Studio, Git,{" "}
          <a
            className="text-accent underline-offset-2 hover:underline"
            href="https://github.com/rojo-rbx/rokit"
          >
            Rokit
          </a>
          , en de Rojo-plugin in Studio. Daarna, in de map{" "}
          <span className="font-mono text-sm">rbx/</span>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface p-4 font-mono text-xs leading-relaxed">{`git clone https://github.com/chat-l18l/roblox_world_driver.git
cd roblox_world_driver/rbx
rokit install
rojo plugin install          # of: rbxm in Studio-pluginsmap
rojo serve`}</pre>
        <p className="mt-3 text-[17px] leading-relaxed">
          In Studio: leeg place, HttpService aan, Rojo-plugin → Connect. Play. Je
          ziet een vloer, een busje, een stempel-doel. WASD: A is links. Dat is
          slice 1 — bewegen — niet de hele wereldkaart.
        </p>
        <p className="mt-3 text-[17px] leading-relaxed">
          Publiceren naar Roblox (kinderen) pas als Play lokaal klopt: Studio →
          File → Publish to Roblox. Niet vanuit deze chat.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Dagelijkse loop</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-[17px] leading-relaxed">
          <li>
            In chat: logica of leerlijn wijzigen. Tests in{" "}
            <span className="font-mono text-sm">src/sim/</span> blijven groen. Preview
            bevestigt de rit.
          </li>
          <li>
            Op de pc: <span className="font-mono text-sm">git pull</span> in de repo.
            Als de FSM veranderde, dezelfde overgangen in{" "}
            <span className="font-mono text-sm">rbx/src/shared/Sim</span>.
          </li>
          <li>
            <span className="font-mono text-sm">rojo serve</span> draait al, of start
            hem. Studio Play. Geen place-file committen.
          </li>
          <li>
            3D-look (materialen, depot, bus-mesh) alleen in Studio, of later als
            assets die Rojo niet hoeft te bezitten.
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Look en feel — splitsing</h2>
        <ul className="mt-4 space-y-2 text-[17px] leading-relaxed">
          <li>
            <strong>Feel van de rit</strong> (tempo, koers, quiz-timing) bewijzen we
            hier. Verkeerde pedagogie los je niet met een mooi mesh.
          </li>
          <li>
            <strong>Roblox-look</strong> (personage, 3D-hub, lighting, UI) hoort in
            Studio. De webkaart is een noord-omhoog-simulator, geen texture-atlas
            voor 3D.
          </li>
          <li>
            <strong>Niet nu:</strong> heel Europa nasnijden in parts. Eerst één depot,
            één doel-part, dezelfde FSM.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-tight">Volgende slice</h2>
        <p className="mt-3 text-[17px] leading-relaxed">
          Slice 1 staat in <span className="font-mono text-sm">rbx/</span>: server
          spawnt vloer + bus + doel, client stuurt. Daarna slice 2: overlap met
          DOEL wordt het aankomst-event van{" "}
          <span className="font-mono text-sm">reduceSession</span>. Quiz komt pas
          als aankomst in Studio hetzelfde voelt als in de preview.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/speel">Rit in de preview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/atelier">Architectuur</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
