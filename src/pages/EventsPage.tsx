import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import LoadingState from "../components/LoadingState";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchPublicEvents } from "../services/events";
import { EventItem } from "../types/domain";

const filters = ["PMR", "Débutant", "Femmes", "Gratuit"];

function EventsPage() {
  useDocumentMeta("Programme", "Filtre les séances et découvre les événements publiés par les organisateurs Solimouv’.");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const nextEvents = await fetchPublicEvents();
        if (!active) return;
        setEvents(nextEvents);
      } catch (serviceError) {
        if (!active) return;
        setError((serviceError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5 pb-3">
      <section>
        <h1 className="text-6xl font-black leading-[0.9] text-[#0f1218]">Cette semaine</h1>
        <p className="mt-3 max-w-[340px] text-lg leading-snug text-[#7f828b]">
          Filtre les séances utiles pour toi. Appuie pour voir les détails.
        </p>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="shrink-0 rounded-full border border-[#cfd2d8] bg-[#f1f1f4] px-5 py-2 text-lg font-medium text-[#4f535e]"
          >
            {filter}
          </button>
        ))}
      </section>

      {loading ? <LoadingState /> : null}

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && events.length === 0 ? (
        <p className="rounded-2xl bg-[#ededf1] p-4 text-sm text-[#5c6069]">Aucun événement publié pour le moment.</p>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <section className="space-y-3" aria-label="Liste des événements">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default EventsPage;
