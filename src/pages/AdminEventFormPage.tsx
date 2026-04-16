import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";
import LoadingState from "../components/LoadingState";
import PageHeading from "../components/PageHeading";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { createEvent, fetchAdminEventById, updateEvent } from "../services/events";
import { fetchOrganizations } from "../services/organizations";
import { EventWriteInput, Organization } from "../types/domain";
import { toLocalDateTimeInputValue } from "../utils/date";
import { slugify } from "../utils/slug";

type EventFormState = {
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  start_date: string;
  end_date: string;
  location: string;
  cover_image: string;
  is_published: boolean;
  is_main_event: boolean;
  organization_id: string;
};

const initialFormState: EventFormState = {
  title: "",
  slug: "",
  short_description: "",
  long_description: "",
  start_date: "",
  end_date: "",
  location: "",
  cover_image: "",
  is_published: false,
  is_main_event: false,
  organization_id: ""
};

function AdminEventFormPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  useDocumentMeta(isEditMode ? "Modifier un événement" : "Créer un événement");

  const [form, setForm] = useState<EventFormState>(initialFormState);
  const [slugTouched, setSlugTouched] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageTitle = useMemo(
    () => (isEditMode ? "Modifier l'événement" : "Créer un événement"),
    [isEditMode]
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const orgs = await fetchOrganizations();
        if (!active) return;
        setOrganizations(orgs);

        if (!id) {
          setLoading(false);
          return;
        }

        const currentEvent = await fetchAdminEventById(id);
        if (!active) return;

        if (!currentEvent) {
          setError("Événement introuvable.");
          setLoading(false);
          return;
        }

        setForm({
          title: currentEvent.title,
          slug: currentEvent.slug,
          short_description: currentEvent.short_description,
          long_description: currentEvent.long_description,
          start_date: toLocalDateTimeInputValue(currentEvent.start_date),
          end_date: toLocalDateTimeInputValue(currentEvent.end_date),
          location: currentEvent.location,
          cover_image: currentEvent.cover_image ?? "",
          is_published: currentEvent.is_published,
          is_main_event: currentEvent.is_main_event,
          organization_id: currentEvent.organization_id ?? ""
        });
      } catch (serviceError) {
        if (!active) return;
        setError((serviceError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [id]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "title" && !slugTouched) {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: slugify(value)
      }));
      return;
    }

    if (name === "slug") {
      setSlugTouched(true);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user.id) {
      setError("Session invalide.");
      return;
    }

    if (!form.start_date || !form.end_date) {
      setError("Les dates de début et de fin sont obligatoires.");
      return;
    }

    const startDateIso = new Date(form.start_date).toISOString();
    const endDateIso = new Date(form.end_date).toISOString();

    if (new Date(endDateIso).getTime() <= new Date(startDateIso).getTime()) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    const payload: EventWriteInput = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      short_description: form.short_description,
      long_description: form.long_description,
      start_date: startDateIso,
      end_date: endDateIso,
      location: form.location,
      cover_image: form.cover_image || null,
      is_published: form.is_published,
      is_main_event: form.is_main_event,
      organization_id: form.organization_id || null
    };

    setIsSubmitting(true);
    setError(null);

    try {
      if (id) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload, session.user.id);
      }

      navigate("/admin/evenements");
    } catch (serviceError) {
      setError((serviceError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container className="space-y-8">
      <PageHeading title={pageTitle} intro="Les champs ci-dessous pilotent la publication dans la partie publique." />

      <div>
        <Link to="/admin/evenements" className="text-sm font-semibold text-brand-700 underline">
          Retour à la liste admin
        </Link>
      </div>

      {loading ? <LoadingState /> : null}

      {!loading ? (
        <section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-800">Titre</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium text-slate-800">Slug</label>
              <input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="short_description" className="mb-1 block text-sm font-medium text-slate-800">Description courte</label>
              <textarea
                id="short_description"
                name="short_description"
                value={form.short_description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="long_description" className="mb-1 block text-sm font-medium text-slate-800">Description longue</label>
              <textarea
                id="long_description"
                name="long_description"
                value={form.long_description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start_date" className="mb-1 block text-sm font-medium text-slate-800">Début</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={form.start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-slate-800">Fin</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={form.end_date}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-800">Lieu</label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="cover_image" className="mb-1 block text-sm font-medium text-slate-800">Image de couverture (URL)</label>
              <input
                id="cover_image"
                name="cover_image"
                value={form.cover_image}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="organization_id" className="mb-1 block text-sm font-medium text-slate-800">Association organisatrice</label>
              <select
                id="organization_id"
                name="organization_id"
                value={form.organization_id}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Aucune</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={form.is_published}
                  onChange={handleInputChange}
                />
                Publier immédiatement
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="is_main_event"
                  checked={form.is_main_event}
                  onChange={handleInputChange}
                />
                Marquer comme événement principal
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Enregistrement..." : isEditMode ? "Enregistrer" : "Créer"}
            </button>
          </form>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : null}
    </Container>
  );
}

export default AdminEventFormPage;
