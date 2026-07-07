import { useInstallPrompt } from "@/hooks/use-install-prompt";

export function InstallButton() {
  const { canInstall, install } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <button
      onClick={install}
      className="btn-bounce shadow-pop flex w-full items-center justify-center gap-2 rounded-3xl bg-fun-purple px-6 py-4 font-display text-lg font-bold text-primary-foreground"
    >
      📲 Install the App on Your Phone
    </button>
  );
}
