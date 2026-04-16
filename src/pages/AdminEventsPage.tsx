import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import LoadingState from "../components/LoadingState";
import PageHeading from "../components/PageHeading";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { deleteEvent, fetchAdminEvents, updateEvent } from "../services/events";
import { EventItem } from "../types/domain";
import { formatDateTime } from "../utils/date";

function AdminEventsPage() {
  useDocumentMeta("Admin événements");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAdminEvents() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminEvents();
      setEvents(data);
    } catch (serviceError) {
      setError((serviceError as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminEvents();
  }, []);

  async function handleDelete(eventId: string) {
    const confirmed = window.confirm("Supprimer cet événement ?");
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      await loadAdminEvents();
    } catch (serviceError) {
      setError((serviceError as Error).message);
    }
  }

  async function handleTogglePublish(event: EventItem) {
    try {
      await updateEvent(event.id, {
        title: event.title,
        slug: event.slug,
        short_description: event.short_description,
        long_description: event.long_description,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        cover_image: event.cover_image,
        is_published: !event.is_published,
        is_main_event: event.is_main_event,
        organization_id: event.organization_id
      });

      await loadAdminEvents();
    } catch (serviceError) {
      setError((serviceError as Error).message);
    }
  }

  return (
    <Container className="space-y-8">
      <PageHeading
        title="Administration des événements"
        intro="Seuls les rôles organizer et admin peuvent créer, modifier, supprimer et publier les événements."
      />

      <div>
        <Link
          to="/admin/evenements/nouveau"
          className="inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Créer un événement
        </Link>
      </div>

      {loading ? <LoadingState /> : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          Aucun événement pour le moment.
        </p>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <section className="space-y-3" aria-label="Liste admin des événements">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>
                  <p className="mt-1 text-sm text-slate-700">{event.short_description}</p>
                  <p className="mt-2 text-xs text-slate-600">{formatDateTime(event.start_date)} · {event.location}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      event.is_published ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {event.is_published ? "Publié" : "Brouillon"}
                    </span>
                    {event.is_main_event ? (
                      <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                        Principal
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/admin/evenements/${event.id}/modifier`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Modifier
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleTogglePublish(event)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    {event.is_published ? "Dépublier" : "Publier"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </Container>
  );
}

export default AdminEventsPage;
