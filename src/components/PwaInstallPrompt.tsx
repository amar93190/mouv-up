import { useEffect, useState } from "react";
import { useFestivalMode } from "../contexts/FestivalModeContext";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "solimouv_pwa_prompt_dismissed_at";
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const mediaMatch = window.matchMedia("(display-mode: standalone)").matches;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return mediaMatch || Boolean(nav.standalone);
}

function wasDismissedRecently() {
  if (typeof window === "undefined") return false;
  const value = window.localStorage.getItem(DISMISS_KEY);
  if (!value) return false;

  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp < DISMISS_DURATION_MS;
}

function markDismissed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

function PwaInstallPrompt() {
  const { festivalMode } = useFestivalMode();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandaloneMode() || wasDismissedRecently()) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleInstalled() {
      setVisible(false);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;

    setInstalling(true);
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstalling(false);
    setInstallEvent(null);

    if (choice.outcome === "accepted") {
      setVisible(false);
      return;
    }

    markDismissed();
    setVisible(false);
  }

  function handleDismiss() {
    markDismissed();
    setVisible(false);
  }

  if (!visible || !installEvent || isStandaloneMode()) return null;

  return (
    <aside
      className={festivalMode
        ? "fixed bottom-6 right-6 z-[1100] hidden w-[360px] rounded-2xl border border-[#2b4ca8] bg-[#081b62] p-4 shadow-[0_20px_50px_rgba(4,14,58,0.5)] md:block"
        : "fixed bottom-6 right-6 z-[1100] hidden w-[360px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.16)] md:block"}
      role="dialog"
      aria-live="polite"
      aria-label="Installer l'application"
    >
      <h3 className={festivalMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-900"}>
        Installer Solimouv’
      </h3>
      <p className={festivalMode ? "mt-2 text-sm text-[#c8d7ff]" : "mt-2 text-sm text-slate-600"}>
        Installe l&apos;app pour un accès rapide depuis ton écran d&apos;accueil.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          className={festivalMode
            ? "inline-flex rounded-lg bg-[#8db7ff] px-3 py-2 text-sm font-semibold text-[#0b1d57] disabled:opacity-60"
            : "inline-flex rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"}
        >
          {installing ? "Ouverture..." : "Installer"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className={festivalMode
            ? "inline-flex rounded-lg border border-[#3a5fbf] px-3 py-2 text-sm font-semibold text-[#d7e3ff]"
            : "inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"}
        >
          Plus tard
        </button>
      </div>
    </aside>
  );
}

export default PwaInstallPrompt;
