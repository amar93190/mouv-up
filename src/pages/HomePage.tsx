import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchPublicEvents, fetchPublicMainEvents } from "../services/events";
import { EventItem } from "../types/domain";
import { buildCountdownLabel, formatDateTime } from "../utils/date";
import { getHomeEventMode } from "../utils/eventMode";

const fallbackSessions = [
  {
    title: "Yoga doux inclusif",
    subtitle: "Maison Sport Santé, 12 Rue des Lilas · PMR · Débutant",
    color: "from-[#1f66e5] to-[#2f7dff]",
    textClass: "text-white"
  },
  {
    title: "Football sans pression",
    subtitle: "Gymnase Caillaux, 75013 Paris · Mixte",
    color: "from-[#7e56df] to-[#9a70ff]",
    textClass: "text-white"
  }
];

function HomePage() {
  useDocumentMeta(
    "Accueil",
    "Bienvenue sur Solimouv’, l'app inclusive d'Up Sport! pour découvrir et rejoindre des séances toute l'année."
  );

  const { profile, isAuthenticated } = useAuth();
  const [mainEvents, setMainEvents] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!isSupabaseConfigured) return;

      const [mainEventData, eventData] = await Promise.all([fetchPublicMainEvents(), fetchPublicEvents()]);
      if (!active) return;

      setMainEvents(mainEventData);
      setEvents(eventData.slice(0, 2));
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const mode = useMemo(() => getHomeEventMode(mainEvents), [mainEvents]);

  return (
    <div className="space-y-6 pb-4">
      <section className="space-y-2">
        <h1 className="text-[44px] font-black leading-none text-[#0f1218]">
          Bienvenue, {profile?.full_name?.split(" ")[0] ?? "Aminata"} <span aria-hidden="true">👋🏼</span>
        </h1>
        <p className="max-w-[320px] text-[28px] font-semibold leading-[1.08] text-[#0f1218]">
          Le sport inclusif, à ton rythme.
        </p>
        <p className="max-w-[360px] text-lg leading-snug text-[#7f828b]">
          On t'aide à trouver une séance qui respecte ton énergie, ton budget et tes besoins.
        </p>
      </section>

      <section className="space-y-3">
        <Link
          to="/evenements"
          className="flex h-14 items-center justify-center rounded-full bg-brand-500 px-6 text-lg font-semibold text-white"
        >
          Trouver mon sport idéal
        </Link>
        <Link
          to="/evenements"
          className="flex h-14 items-center justify-center rounded-full border border-brand-500 bg-white px-6 text-lg font-semibold text-[#262a31]"
        >
          Voir le programme
        </Link>
      </section>

      {mode.type !== "normal" ? (
        <section className="rounded-3xl bg-gradient-to-r from-[#0f3d96] to-[#1e67e8] p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Événement principal</p>
          <h2 className="mt-1 text-2xl font-bold">{mode.event.title}</h2>
          <p className="mt-2 text-sm text-blue-100">{formatDateTime(mode.event.start_date)} · {mode.event.location}</p>
          {mode.type === "countdown" ? (
            <p className="mt-3 text-base font-semibold">{buildCountdownLabel(mode.daysRemaining)}</p>
          ) : (
            <p className="mt-3 text-base font-semibold">Événement en cours</p>
          )}
          <Link to={`/evenements/${mode.event.slug}`} className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1949b4]">
            Ouvrir
          </Link>
        </section>
      ) : null}

      <section className="rounded-3xl bg-[#f0f0f3] p-4">
        <p className="text-xl font-semibold text-brand-500">Activité</p>
        <h2 className="mt-1 text-4xl font-black leading-tight text-[#0f1218]">Tes prochaines séances</h2>

        <div className="mt-4 space-y-3">
          {(events.length > 0
            ? events.map((event, index) => ({
                title: event.title,
                subtitle: `${event.location} · ${formatDateTime(event.start_date)}`,
                color: index % 2 === 0 ? "from-[#1f66e5] to-[#2f7dff]" : "from-[#7e56df] to-[#9a70ff]",
                textClass: "text-white"
              }))
            : fallbackSessions
          ).map((session) => (
            <article key={session.title} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${session.color} p-5`}>
              <div className={`max-w-[240px] ${session.textClass}`}>
                <h3 className="text-2xl font-semibold leading-tight">{session.title}</h3>
                <p className="mt-2 text-sm opacity-90">{session.subtitle}</p>
              </div>
              <span className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#f0f0f3] p-4">
        <p className="text-xl font-semibold text-brand-500">Mouv’Pass</p>
        <h2 className="mt-1 text-4xl font-black leading-tight text-[#0f1218]">Ton élan du moment</h2>

        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#ededf0] p-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#1f66e5_270deg,#d8d8dd_0deg)]">
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-black">150</span>
              <span className="text-sm text-[#6d7078]">Pts</span>
            </div>
          </div>
          <p className="text-xl font-semibold leading-snug text-[#171a20]">Encore 50 points avant le prochain palier</p>
        </div>

        <Link
          to={isAuthenticated ? "/profil" : "/connexion"}
          className="mt-4 inline-flex rounded-full border border-[#d1d4db] px-4 py-2 text-sm font-semibold text-[#2a2f38]"
        >
          Voir mon pass
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
