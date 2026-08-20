import { useState } from "react";
import { RefundRequest } from "@/components/RefundRequest";

type View = "menu" | "support" | "about";

export function SettingsPanel({ onEditProfile }: { onEditProfile?: () => void }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");

  const close = () => {
    setOpen(false);
    setView("menu");
  };

  if (!open) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setOpen(true)}
          className="btn-bounce w-full rounded-2xl border-2 border-border bg-muted px-4 py-3 font-display text-base font-bold text-muted-foreground"
        >
          ⚙️ Settings
        </button>
      </div>
    );
  }

  return (
    <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-card p-5 animate-pop-in">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold">
          {view === "menu" && "⚙️ Settings"}
          {view === "support" && "💬 Support"}
          {view === "about" && "ℹ️ About"}
        </h2>
        <button
          onClick={view === "menu" ? close : () => setView("menu")}
          className="rounded-xl border-2 border-border px-3 py-2 font-display text-sm font-extrabold text-muted-foreground"
        >
          {view === "menu" ? "Close" : "← Back"}
        </button>
      </div>

      {view === "menu" && (
        <div className="space-y-3">
          {onEditProfile && (
            <MenuItem emoji="🦊" label="Kid profile" desc="Name, level and theme" onClick={onEditProfile} />
          )}
          <MenuItem

            emoji="💬"
            label="Support"
            desc="Help, contact and refunds"
            onClick={() => setView("support")}
          />
          <MenuItem emoji="ℹ️" label="About" desc="App version and legal" onClick={() => setView("about")} />
        </div>
      )}




      {view === "about" && (
        <div className="space-y-3 text-base font-bold">
          <InfoRow label="App" value="UNO Method" />
          <InfoRow label="Version" value="1.0.0" />
        </div>
      )}

      {view === "support" && (
        <div className="space-y-3">
          <div className="rounded-2xl border-4 border-border bg-background px-4 py-4">
            <p className="font-display text-base font-extrabold">❓ Printing help</p>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              Print on A4 or Letter, 100% scale, single-sided, on thick paper for best results.
            </p>
          </div>
          <div className="pt-1">
            <RefundRequest />
          </div>
        </div>
      )}
    </section>
  );
}

function MenuItem({
  emoji,
  label,
  desc,
  onClick,
}: {
  emoji: string;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-bounce flex w-full items-center gap-3 rounded-2xl border-4 border-border bg-background px-4 py-4 text-left"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-extrabold">{label}</span>
        <span className="block text-sm font-bold text-muted-foreground">{desc}</span>
      </span>
      <span className="font-display text-lg font-extrabold text-muted-foreground">›</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b-2 border-dashed border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words text-right font-extrabold">{value}</span>
    </div>
  );
}
