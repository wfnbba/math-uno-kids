import type { ReactNode } from "react";

/**
 * Native-app shell: on phones it's edge-to-edge, on desktop the whole app is
 * rendered inside a centered phone-sized column so it never looks like a website.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted md:bg-gradient-to-br md:from-fun-purple/25 md:via-fun-blue/20 md:to-fun-green/25">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background md:min-h-[100dvh] md:border-x-4 md:border-border md:shadow-2xl">
        {children}
      </div>
    </div>
  );
}
