import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { fetchMyRegistrations } from "../services/registrations";
import { EventRegistrationWithEvent } from "../types/domain";
import { formatDateTime } from "../utils/date";

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
    <div className="space-y-5 pb-3">
      <section>
        <h1 className="text-6xl font-black leading-[0.9] text-[#0f1218]">Points solidaires</h1>
        <p className="mt-3 max-w-[340px] text-lg leading-snug text-[#7f828b]">
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

      <section className="rounded-3xl bg-[#ededf1] p-5">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#1f66e5_270deg,#d7d8dd_0deg)]">
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#f1f1f4]">
            <span className="text-5xl font-black leading-none">{points}</span>
            <span className="text-4xl text-[#60646f]">Pts</span>
          </div>
        </div>
        <p className="mt-4 text-center text-4xl font-semibold leading-tight text-[#171a20]">Encore 50 points avant le prochain palier</p>
      </section>

      <button type="button" className="flex h-14 w-full items-center justify-center rounded-full bg-brand-500 text-lg font-semibold text-white">
        Scanner le QR Code du Coach
      </button>

      <section className="rounded-3xl bg-[#ededf1] p-4">
        <p className="text-xl font-semibold text-brand-500">Historique</p>
        <h2 className="mt-1 text-5xl font-black leading-tight text-[#0f1218]">Présences récentes</h2>

        {loading ? <div className="mt-3"><LoadingState /></div> : null}

        {!loading && registrations.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-[#5c6069]">
            Aucune présence pour le moment. <Link to="/evenements" className="font-semibold text-brand-700">Voir le programme</Link>
          </p>
        ) : null}

        {!loading ? (
          <div className="mt-3 space-y-3">
            {registrations.slice(0, 4).map((registration) => (
              <article key={registration.id} className="rounded-2xl bg-white p-4">
                <p className="text-[30px] font-bold leading-none text-[#14171e]">+50 pts</p>
                <p className="mt-2 text-[28px] text-[#4f535e]">{registration.events.title}</p>
                <p className="text-[23px] text-[#6c7079]">{formatDateTime(registration.events.start_date)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default ProfilePage;
