import { createFileRoute } from "@tanstack/react-router";
import { GameScreen } from "@/game/GameScreen.tsx";

export const Route = createFileRoute("/speel")({ component: Speel });

function Speel() {
  return <GameScreen />;
}
