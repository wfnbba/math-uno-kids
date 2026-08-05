import { Link, useRouterState } from "@tanstack/react-router";

const TABS = [
  { to: "/", emoji: "🏠", label: "Home" },
  { to: "/play", emoji: "🎮", label: "Play" },
  { to: "/purchases", emoji: "🎁", label: "Your\nPurchases" },
  { to: "/progress", emoji: "⭐", label: "Progress" },
  { to: "/parents", emoji: "📊", label: "Parents &\nTeachers" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t-4 border-border bg-card pb-[env(safe-area-inset-bottom)] md:border-x-4">
      <div className="flex items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-center font-display text-[11px] font-bold leading-[1.1] whitespace-pre-line min-h-16 transition-colors ${
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
