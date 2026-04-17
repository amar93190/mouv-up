import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import PointsGauge from "../components/PointsGauge";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { useAuth } from "../hooks/useAuth";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { fetchMyRegistrations } from "../services/registrations";
import { EventRegistrationWithEvent } from "../types/domain";

function ProfilePage() {
  useDocumentMeta("Pass", "Ton pass solidaire avec points et historique des présences récentes.");

  const { session, profile, signOut } = useAuth();
  const { festivalMode } = useFestivalMode();
  const [registrations, setRegistrations] = useState<EventRegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRegistrations() {
      if (!session?.user.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMyRegistrations(session.user.id);
        if (!active) return;
        setRegistrations(data);
      } catch (serviceError) {
        if (!active) return;
        setError((serviceError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRegistrations();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const points = useMemo(() => 100 + registrations.length * 25, [registrations.length]);
  const fullName = profile?.full_name?.trim() || null;
  const displayName = fullName ?? session?.user.email ?? "Utilisateur";
  const initials = useMemo(() => {
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0] ?? "";
      const second = parts[1]?.[0] ?? "";
      return `${first}${second}`.toUpperCase() || "U";
    }
    const emailInitial = session?.user.email?.[0] ?? "U";
    return emailInitial.toUpperCase();
  }, [fullName, session?.user.email]);

  return (
    <div className="space-y-6 pb-3 md:grid md:grid-cols-12 md:gap-6 md:space-y-0">
      <section className="md:col-span-12">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={festivalMode
              ? "inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#33529f] bg-[#0a1f69] text-base font-semibold text-[#d7e3ff]"
              : "inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#d1d5db] text-base font-semibold text-[#374151]"}
            aria-label="Photo de profil"
          >
            {initials}
          </div>
          <div>
            <p className={festivalMode ? "text-sm text-[#c7d8ff]" : "text-sm text-[#6b7280]"}>Profil</p>
            <p className={festivalMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-[#111827]"}>
              {displayName}
            </p>
          </div>
        </div>

        <h1 className={festivalMode ? "text-[32px] font-semibold tracking-[-0.01em] text-white md:text-[40px]" : "text-[32px] font-semibold tracking-[-0.01em] text-black md:text-[40px]"}>Points solidaires</h1>
        <p className={festivalMode ? "mt-2 max-w-[352px] text-base text-[#cfdbff]" : "mt-2 max-w-[352px] text-base text-[#868688]"}>
          Chaque séance validée fait monter ton compteur et renforce ton parcours.
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => void signOut()}
            className={festivalMode
              ? "rounded-full border border-[#33529f] bg-[#0a1f69] px-3 py-1.5 text-xs font-semibold text-[#d7e3ff]"
              : "rounded-full border border-[#cfd2d9] bg-white px-3 py-1.5 text-xs font-semibold text-[#3a3f49]"}
          >
            Se déconnecter
          </button>
        </div>
      </section>

      <section className={festivalMode ? "rounded-lg border border-[#1a3e98] bg-[#081b62] p-4 md:col-span-4 md:p-6" : "rounded-lg bg-[#fafafa] p-4 md:col-span-4 md:p-6"}>
        <div className="mx-auto w-fit">
          <PointsGauge
            value={points}
            max={200}
            size={128}
            thickness={14}
            fillColor={festivalMode ? "#8db7ff" : "#1b61f3"}
            trackColor={festivalMode ? "#2a488f" : "#e7e7e7"}
            innerColor={festivalMode ? "#081b62" : "#fafafa"}
            valueClassName={festivalMode ? "text-[32px] font-semibold leading-none tracking-[-0.02em] text-white" : "text-[32px] font-semibold leading-none tracking-[-0.02em] text-black"}
            labelClassName={festivalMode ? "text-[23px] leading-none tracking-[-0.02em] text-[#c7d8ff]" : "text-[23px] leading-none tracking-[-0.02em] text-[#474749]"}
          />
        </div>

        <p className={festivalMode ? "mt-4 text-center text-base font-semibold tracking-[-0.02em] text-white" : "mt-4 text-center text-base font-semibold tracking-[-0.02em] text-black"}>Encore 50 points avant le prochain palier</p>
      </section>

      <button
        type="button"
        className={festivalMode
          ? "flex h-14 w-full items-center justify-center gap-2 rounded-[56px] bg-[#8db7ff] text-base font-semibold text-[#0b1d57] md:col-span-8 md:h-full md:min-h-[184px]"
          : "flex h-14 w-full items-center justify-center gap-2 rounded-[56px] bg-[#0760fc] text-base font-medium text-white md:col-span-8 md:h-full md:min-h-[184px]"}
      >
        Scanner le QR Code du Coach
        <QrIcon />
      </button>

      <section className={festivalMode ? "rounded-xl border border-[#1a3e98] bg-[#081b62] px-4 py-8 md:col-span-12 md:px-6" : "rounded-xl bg-[#fafafa] px-4 py-8 md:col-span-12 md:px-6"}>
        <p className="text-base font-medium tracking-[-0.02em] text-[#0760fc]">Historique</p>
        <h2 className={festivalMode ? "mt-1 text-[24px] font-semibold tracking-[-0.02em] text-white" : "mt-1 text-[24px] font-semibold tracking-[-0.02em] text-black"}>Présences récentes</h2>

        {loading ? (
          <div className="mt-3">
            <LoadingState />
          </div>
        ) : null}

        {!loading && error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : null}

        {!loading && !error && registrations.length === 0 ? (
          <p className={festivalMode ? "mt-4 rounded-lg bg-[#0f2a81] p-4 text-sm text-[#d0dcff]" : "mt-4 rounded-lg bg-white p-4 text-sm text-[#5c6069]"}>
            Aucune présence pour le moment.{" "}
            <Link to="/evenements" className={festivalMode ? "font-semibold text-[#8db7ff]" : "font-semibold text-brand-700"}>
              Voir le programme
            </Link>
          </p>
        ) : null}

        {!loading && !error ? (
          <div className="mt-4 space-y-4">
            {registrations.slice(0, 4).map((registration) => (
              <article key={registration.id} className={festivalMode ? "rounded-lg bg-[#0f2a81] p-4" : "rounded-lg bg-white p-4"}>
                <p className={festivalMode ? "text-base font-semibold tracking-[-0.02em] text-white" : "text-base font-semibold tracking-[-0.02em] text-black"}>+50 pts</p>
                <p className={festivalMode ? "mt-2 text-base tracking-[-0.02em] text-[#c9dbff]" : "mt-2 text-base tracking-[-0.02em] text-[#474749]"}>{registration.events.title}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function QrIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v6M14 20h3" />
    </svg>
  );
}

export default ProfilePage;
