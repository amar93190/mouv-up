import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { fetchMyRegistrations } from "../services/registrations";
import { EventRegistrationWithEvent } from "../types/domain";

function ProfilePage() {
  useDocumentMeta("Pass", "Ton pass solidaire avec points et historique des présences récentes.");

  const { session, signOut } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 pb-3">
      <section>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] text-black">Points solidaires</h1>
        <p className="mt-2 max-w-[352px] text-base text-[#868688]">
          Chaque séance validée fait monter ton compteur et renforce ton parcours.
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-[#cfd2d9] bg-white px-3 py-1.5 text-xs font-semibold text-[#3a3f49]"
          >
            Se déconnecter
          </button>
        </div>
      </section>

      <section className="rounded-lg bg-[#fafafa] p-4">
        <div className="mx-auto relative h-32 w-32">
          <img src="/images/figma/ring-base.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
          <img src="/images/figma/ring-progress.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
          <img src="/images/figma/ring-inner.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-1">
            <span className="text-[32px] font-semibold leading-none tracking-[-0.02em]">{points}</span>
            <span className="text-[23px] leading-none tracking-[-0.02em] text-[#474749]">Pts</span>
          </div>
        </div>

        <p className="mt-4 text-center text-base font-semibold tracking-[-0.02em] text-black">Encore 50 points avant le prochain palier</p>
      </section>

      <button type="button" className="flex h-14 w-full items-center justify-center gap-2 rounded-[56px] bg-[#0760fc] text-base font-medium text-white">
        Scanner le QR Code du Coach
        <QrIcon />
      </button>

      <section className="rounded-xl bg-[#fafafa] px-4 py-8">
        <p className="text-base font-medium tracking-[-0.02em] text-[#0760fc]">Historique</p>
        <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-black">Présences récentes</h2>

        {loading ? (
          <div className="mt-3">
            <LoadingState />
          </div>
        ) : null}

        {!loading && registrations.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-4 text-sm text-[#5c6069]">
            Aucune présence pour le moment. <Link to="/evenements" className="font-semibold text-brand-700">Voir le programme</Link>
          </p>
        ) : null}

        {!loading ? (
          <div className="mt-4 space-y-4">
            {registrations.slice(0, 4).map((registration) => (
              <article key={registration.id} className="rounded-lg bg-white p-4">
                <p className="text-base font-semibold tracking-[-0.02em] text-black">+50 pts</p>
                <p className="mt-2 text-base tracking-[-0.02em] text-[#474749]">{registration.events.title}</p>
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
