import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { useAuth } from "../hooks/useAuth";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function getInstallHelpMessage() {
  if (typeof window === "undefined") return "Installation non disponible pour l'instant.";

  const ua = window.navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isInAppBrowser =
    /FBAN|FBAV|Instagram|Line|Twitter|LinkedInApp|Snapchat|TikTok|wv/i.test(ua);

  if (isInAppBrowser) {
    return "Installation non disponible dans ce navigateur intégré. Ouvre ce lien dans Safari ou Chrome, puis réessaie l’installation.";
  }

  if (isIOS) {
    return "Sur iPhone/iPad: ouvre le menu Partager puis choisis « Sur l’écran d’accueil » pour installer l’app.";
  }

  if (isAndroid) {
    return "Sur Android: ouvre le menu du navigateur (⋮) puis choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».";
  }

  return "Installation non disponible pour l'instant sur cet appareil. Essaie avec Chrome, Edge ou Safari.";
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const mediaMatch = window.matchMedia("(display-mode: standalone)").matches;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return mediaMatch || Boolean(nav.standalone);
}

function Header() {
  const { isAuthenticated } = useAuth();
  const { festivalMode } = useFestivalMode();
  const location = useLocation();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (isStandaloneMode()) return;

    if (!installEvent) {
      const devHint =
        import.meta.env.DEV && import.meta.env.VITE_ENABLE_PWA_DEV !== "true"
          ? " En local, active VITE_ENABLE_PWA_DEV=true puis redémarre le serveur."
          : "";
      window.alert(getInstallHelpMessage() + devHint);
      return;
    }

    setInstalling(true);
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstalling(false);
    setInstallEvent(null);
  }

  if (location.pathname.startsWith("/admin")) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-extrabold text-slate-900">Solimouv’</Link>
          <nav className="flex items-center gap-2 text-sm">
            <NavLink to="/admin/evenements" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">Admin</NavLink>
            <NavLink to="/admin/evenements/nouveau" className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white hover:bg-brand-700">Nouveau</NavLink>
            <NavLink to="/" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">App</NavLink>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="mx-auto w-full max-w-[430px] px-4 pt-4 md:max-w-[1320px] md:px-10 md:pt-8">
      <div className={festivalMode
        ? "mb-5 flex items-center justify-between md:mb-0 md:rounded-[18px] md:border md:border-[#1a3e98] md:bg-[#081a60] md:px-8 md:py-5"
        : "mb-5 flex items-center justify-between md:mb-0 md:rounded-[18px] md:border md:border-[#e2e4ea] md:bg-white md:px-8 md:py-5 md:shadow-[0_10px_30px_rgba(19,22,29,0.06)]"}
      >
        <Link to="/" aria-label="Aller à l'accueil">
          <img src="/images/figma/logo-home.svg" alt="Solimouv’" className="h-[54px] w-[105px] object-contain md:h-[60px] md:w-[120px]" />
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <nav
            className={festivalMode
              ? "hidden items-center gap-2 md:flex"
              : "hidden items-center gap-2 md:flex"}
            aria-label="Navigation principale desktop"
          >
            <DesktopNavLink to="/" label="Accueil" festivalMode={festivalMode} />
            <DesktopNavLink to="/evenements" label="Programme" festivalMode={festivalMode} />
            <DesktopNavLink to="/a-propos" label="Assos" festivalMode={festivalMode} />
            <DesktopNavLink to="/contact" label="Contact" festivalMode={festivalMode} />
          </nav>

          <button
            type="button"
            onClick={() => void handleInstallClick()}
            className={festivalMode
              ? "inline-flex h-9 items-center rounded-full border border-[#3a5fbf] px-3 text-xs font-semibold text-[#d7e3ff] hover:bg-[#183b95] md:h-auto md:px-4 md:py-2 md:text-sm"
              : "inline-flex h-9 items-center rounded-full border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-[#f1f3f8] md:h-auto md:px-4 md:py-2 md:text-sm"}
          >
            {installing ? "Ouverture..." : "Installer"}
          </button>

          <Link
            to={isAuthenticated ? "/profil" : "/connexion"}
            className={festivalMode
              ? "inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0d2d84] text-[#d9e2ff] md:h-12 md:w-12"
              : "inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e7e7ea] text-[#22262d] md:h-12 md:w-12"}
            aria-label={isAuthenticated ? "Ouvrir le profil" : "Se connecter"}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 19c.8-3.1 3.4-5 7-5s6.2 1.9 7 5" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

type DesktopNavLinkProps = {
  to: string;
  label: string;
  festivalMode: boolean;
};

function DesktopNavLink({ to, label, festivalMode }: DesktopNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        festivalMode
          ? isActive
            ? "rounded-full bg-[#8db7ff] px-4 py-2 text-sm font-semibold text-[#0b1d57]"
            : "rounded-full px-4 py-2 text-sm font-medium text-[#d5e1ff] hover:bg-[#183b95]"
          : isActive
            ? "rounded-full bg-[#0760fc] px-4 py-2 text-sm font-semibold text-white"
            : "rounded-full px-4 py-2 text-sm font-medium text-[#545966] hover:bg-[#f1f3f8]"
      }
    >
      {label}
    </NavLink>
  );
}

export default Header;
