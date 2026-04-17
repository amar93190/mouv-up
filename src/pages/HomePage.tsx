import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import MatchingModal from "../components/MatchingModal";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { useAuth } from "../hooks/useAuth";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  fetchPublicEvents,
  fetchPublicFestivalEvents,
  fetchPublicFestivalMainEvents,
  fetchPublicMainEvents
} from "../services/events";
import { EventItem } from "../types/domain";
import { buildCountdownLabel } from "../utils/date";
import { getHomeEventMode } from "../utils/eventMode";

const fallbackSessions = [
  {
    title: "Yoga doux inclusif",
    subtitle: "Maison Sport Santé, 12 Rue Des Lilas - PMR - Débutant",
    cardClass: "bg-[#0760fc] text-white",
    buttonClass: "bg-[#3980fd]",
    deco: "/images/figma/home-card-blue.svg",
    metaClass: "text-[#cccccc]"
  },
  {
    title: "Le Football sans pression",
    subtitle: "Gymnase Caillaux, 3 Rue Caillaux, 75013 Paris",
    cardClass: "bg-[#8a5df4] text-white",
    buttonClass: "bg-[#a17df6]",
    deco: "/images/figma/home-card-purple.svg",
    metaClass: "text-[#cccccc]"
  }
];

function HomePage() {
  useDocumentMeta(
    "Accueil",
    "Bienvenue sur Solimouv’, l'app inclusive d'Up Sport! pour découvrir et rejoindre des séances toute l'année."
  );

  const { profile, isAuthenticated } = useAuth();
  const { festivalMode, toggleFestivalMode } = useFestivalMode();
  const [isMatchingOpen, setIsMatchingOpen] = useState(false);
  const [mainEvents, setMainEvents] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const [mainEventData, eventData] = await Promise.all(
          festivalMode
            ? [fetchPublicFestivalMainEvents(), fetchPublicFestivalEvents()]
            : [fetchPublicMainEvents(), fetchPublicEvents()]
        );
        if (!active) return;

        setMainEvents(mainEventData);
        setEvents(eventData.slice(0, 2));
      } catch (serviceError) {
        if (!active) return;
        setError((serviceError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [festivalMode]);

  const mode = useMemo(() => getHomeEventMode(mainEvents), [mainEvents]);
  const festivalButtonLabel = festivalMode ? "Retourner au mode quotidien" : "Passer en mode festival";

  return (
    <div className="space-y-9 pb-4">
      <section className="space-y-2">
        <h1 className={festivalMode ? "text-[32px] font-semibold tracking-[-0.01em] text-white" : "text-[32px] font-semibold tracking-[-0.01em] text-black"}>
          Bienvenue, {profile?.full_name?.split(" ")[0] ?? "Aminata"} <span aria-hidden="true">👋🏼</span>
        </h1>
        <p className={festivalMode ? "max-w-[352px] text-base text-[#cfdbff]" : "max-w-[352px] text-base text-[#868688]"}>
          On t'aide à trouver une séance qui respecte ton énergie, ton budget et tes besoins.
        </p>
        {mode.type === "countdown" ? (
          <p className={festivalMode ? "text-sm font-medium text-[#c3d4ff]" : "text-sm font-medium text-[#4f4f52]"}>{buildCountdownLabel(mode.daysRemaining)}</p>
        ) : null}
        {mode.type === "active" ? <p className={festivalMode ? "text-sm font-medium text-[#c3d4ff]" : "text-sm font-medium text-[#4f4f52]"}>Événement principal en cours</p> : null}
      </section>

      <section className="relative overflow-hidden rounded-[20px] bg-[#dcaef0] px-4 pb-5 pt-7">
        <span className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full border-[10px] border-[#c98ce6]" aria-hidden="true" />
        <h2 className="max-w-[220px] text-[33px] font-semibold leading-tight tracking-[-0.02em] text-[#14162f]">
          Le Festival Solimouv&apos; c&apos;est aujourd&apos;hui !
        </h2>
        <p className="mt-2 max-w-[320px] text-sm leading-[1.45] text-[#2f3151]">
          Active le programme spécial du jour pour voir les stands, les initiations et les repères du festival.
        </p>
        <button
          type="button"
          onClick={toggleFestivalMode}
          className={festivalMode
            ? "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#2f468d] bg-transparent px-4 text-base font-semibold text-[#0f1d4b]"
            : "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#050c4e] px-4 text-base font-semibold text-white"}
        >
          {festivalButtonLabel}
          <span aria-hidden="true" className="text-xl leading-none">↗</span>
        </button>
      </section>

      <section className="space-y-4">
        <button
          type="button"
          onClick={() => setIsMatchingOpen(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[56px] bg-[#0760fc] px-4 text-base font-medium text-white"
        >
          Trouver mon sport idéal
          <SearchIcon />
        </button>
        <Link
          to="/evenements"
          className="flex h-14 items-center justify-center gap-2 rounded-[56px] border border-[#0760fc] bg-white px-4 text-base font-semibold text-[#232325]"
        >
          Voir le programme
          <CalendarIcon />
        </Link>
      </section>

      <section className="rounded-xl bg-[#fafafa] px-4 py-8">
        <p className="text-base font-medium tracking-[-0.02em] text-[#0760fc]">Activité</p>
        <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-black">Tes prochaines séances</h2>

        {loading ? <LoadingState /> : null}

        {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        {!loading && !error && (events.length > 0 || !isSupabaseConfigured) ? (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {(events.length > 0
              ? events.map((event, index) => ({
                  title: event.title,
                  subtitle: event.location,
                  cardClass: index === 0 ? "bg-[#0760fc] text-white" : "bg-[#8a5df4] text-white",
                  buttonClass: index === 0 ? "bg-[#3980fd]" : "bg-[#a17df6]",
                  deco: index === 0 ? "/images/figma/home-card-blue.svg" : "/images/figma/home-card-purple.svg",
                  metaClass: "text-[#cccccc]"
                }))
              : fallbackSessions
            ).map((session) => (
              <article key={session.title} className={`relative w-[241px] shrink-0 overflow-hidden rounded-[20px] px-4 pb-6 pt-12 ${session.cardClass}`}>
                <img src={session.deco} alt="" aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-[112px] w-[112px]" />
                <h3 className="w-[152px] text-[18px] font-medium leading-[1.2] tracking-[-0.02em]">{session.title}</h3>
                <p className={`mt-1 w-[151px] text-xs leading-[1.5] ${session.metaClass}`}>{session.subtitle}</p>
                <span className={`absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-2xl text-white ${session.buttonClass}`}>
                  ↗
                </span>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && !error && isSupabaseConfigured && events.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-[#ededf1] p-4 text-sm text-[#5c6069]">Aucune séance publiée pour le moment.</p>
        ) : null}
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-base font-medium tracking-[-0.02em] text-[#0760fc]">Mouv&apos;Pass</p>
          <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-black">Ton élan du moment</h2>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-[#fafafa] p-4">
          <div className="relative h-20 w-20 shrink-0">
            <img src="/images/figma/ring-base.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
            <img src="/images/figma/ring-progress.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
            <img src="/images/figma/ring-inner.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-1">
              <span className="text-[20px] font-semibold leading-none tracking-[-0.02em]">150</span>
              <span className="text-[14px] leading-none tracking-[-0.02em] text-[#474749]">Pts</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight tracking-[-0.02em] text-black">Encore 50 points avant le prochain palier</p>
            <p className="mt-2 text-base leading-tight tracking-[-0.02em] text-[#474749]">
              Chaque présence crée du lien et débloque un nouveau bonus solidaire
            </p>
          </div>
        </div>

        <Link to={isAuthenticated ? "/profil" : "/connexion"} className="inline-flex rounded-full border border-[#cccccc] px-4 py-2 text-sm font-medium text-[#232325]">
          Voir mon pass
        </Link>
      </section>

      <MatchingModal isOpen={isMatchingOpen} onClose={() => setIsMatchingOpen(false)} />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

export default HomePage;
