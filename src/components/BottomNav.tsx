import { Link, useRouterState } from "@tanstack/react-router";

const TABS = [
  { to: "/", emoji: "🏠", label: "Home" },
  { to: "/play", emoji: "🎮", label: "Play" },
  { to: "/news", emoji: "🎁", label: "Your Purchases" },
  { to: "/progress", emoji: "⭐", label: "Progress" },
  { to: "/parents", emoji: "📊", label: "Parents & Teachers" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t-4 border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-center font-display text-[10px] font-bold leading-tight transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className={`text-2xl ${active ? "animate-bounce-soft" : ""}`}>{tab.emoji}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
