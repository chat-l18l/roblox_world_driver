import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, GitBranch, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

const NAV = [
  { to: "/", label: "Overzicht", icon: Compass },
  { to: "/speel", label: "Rijden", icon: Truck },
  { to: "/leerlijn", label: "Leerlijn", icon: BookOpen },
  { to: "/atelier", label: "Atelier", icon: GitBranch },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const play = pathname === "/speel";

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-[var(--radius-xs)] border border-dashed border-fg/40 font-display text-sm font-semibold">
              W
            </span>
            <span className="font-display text-lg tracking-tight">Wereldpost</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm transition-colors",
                    active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className={cn("flex-1", play ? "min-h-0" : "")}>{children}</div>
      {!play && (
        <footer className="border-t border-border">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-subtle">
            Webprototype van dezelfde state machines die later naar Roblox/Luau gaan. Roblox
            Studio draait niet in deze preview.
          </p>
        </footer>
      )}
      <nav className="sticky bottom-0 z-30 grid grid-cols-4 border-t border-border bg-bg/95 sm:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
                active ? "text-fg" : "text-muted",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
