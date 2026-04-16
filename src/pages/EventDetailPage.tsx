import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchPublicEventBySlug } from "../services/events";
import { cancelRegistration, fetchRegistrationByEvent, registerToEvent } from "../services/registrations";
import { EventItem, EventRegistration } from "../types/domain";
import { formatDateTime } from "../utils/date";

function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { session, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useDocumentMeta(event ? event.title : "Détail événement", event ? event.short_description : "Consulte un événement Solimouv’.");

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      if (!slug || !isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const foundEvent = await fetchPublicEventBySlug(slug);
        if (!active) return;
        setEvent(foundEvent);

        if (foundEvent && session?.user.id) {
          const registrationState = await fetchRegistrationByEvent(session.user.id, foundEvent.id);
          if (!active) return;
          setRegistration(registrationState);
        }
      } catch (serviceError) {
        if (!active) return;
        setError((serviceError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadEvent();

    return () => {
      active = false;
    };
  }, [session?.user.id, slug]);

  async function handleRegister() {
    if (!session?.user.id || !event) return;

    setActionLoading(true);
    setActionMessage(null);

    try {
      const nextRegistration = await registerToEvent(session.user.id, event.id);
      setRegistration(nextRegistration);
      setActionMessage("Inscription confirmée.");
    } catch (serviceError) {
      setActionMessage((serviceError as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelRegistration() {
    if (!registration) return;

    setActionLoading(true);
    setActionMessage(null);

    try {
      const nextRegistration = await cancelRegistration(registration.id);
      setRegistration(nextRegistration);
      setActionMessage("Inscription annulée.");
    } catch (serviceError) {
      setActionMessage((serviceError as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!event) {
    return (
      <section className="space-y-3 rounded-3xl bg-[#ededf1] p-4">
        <h1 className="text-2xl font-bold text-[#151920]">Événement introuvable</h1>
        <p className="text-sm text-[#59606a]">Cet événement n'est pas publié ou n'existe plus.</p>
        <Link to="/evenements" className="inline-flex rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Retour au programme</Link>
      </section>
    );
  }

  return (
    <div className="space-y-4 pb-3">
      <section className="rounded-3xl bg-[#ededf1] p-4">
        <h1 className="text-4xl font-black leading-tight text-[#0f1218]">{event.title}</h1>
        <p className="mt-2 text-sm text-[#59606a]">{event.short_description}</p>

        <dl className="mt-4 space-y-2 text-sm text-[#252a33]">
          <div>
            <dt className="inline font-semibold">Début : </dt>
            <dd className="inline">{formatDateTime(event.start_date)}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Fin : </dt>
            <dd className="inline">{formatDateTime(event.end_date)}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Lieu : </dt>
            <dd className="inline">{event.location}</dd>
          </div>
        </dl>

        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#2f3440]">{event.long_description}</p>
      </section>

      <section className="rounded-3xl bg-[#ededf1] p-4">
        <h2 className="text-xl font-bold text-[#151920]">Inscription</h2>

        {!isAuthenticated ? (
          <p className="mt-3 text-sm text-[#525862]">
            Connecte-toi pour t'inscrire. <Link className="font-semibold text-brand-700" to="/connexion">Aller à la connexion</Link>
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[#525862]">Statut actuel: <strong>{registration?.registration_status ?? "non inscrit"}</strong></p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRegister}
                disabled={actionLoading}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {actionLoading ? "Traitement..." : "S'inscrire"}
              </button>

              {registration?.registration_status === "registered" ? (
                <button
                  type="button"
                  onClick={handleCancelRegistration}
                  disabled={actionLoading}
                  className="rounded-full border border-[#cfd2d9] bg-white px-4 py-2 text-sm font-semibold text-[#333843] disabled:opacity-60"
                >
                  Annuler
                </button>
              ) : null}
            </div>
            {actionMessage ? <p className="text-sm text-[#444a54]">{actionMessage}</p> : null}
          </div>
        )}
      </section>

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

export default EventDetailPage;
