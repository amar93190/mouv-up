import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import LoadingState from "../components/LoadingState";
import PageHeading from "../components/PageHeading";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import {
  AdminUserAnalytics,
  AnalyticsPeriod,
  fetchAdminUserAnalytics
} from "../services/analytics";
import { deleteEvent, fetchAdminEvents, updateEvent } from "../services/events";
import { EventItem } from "../types/domain";
import { formatDateTime } from "../utils/date";

function AdminEventsPage() {
  useDocumentMeta("Admin événements");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AdminUserAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("30d");

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

  async function loadAnalytics(period: AnalyticsPeriod = analyticsPeriod) {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const data = await fetchAdminUserAnalytics(period);
      setAnalytics(data);
    } catch (serviceError) {
      setAnalyticsError((serviceError as Error).message);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminEvents();
  }, []);

  useEffect(() => {
    void loadAnalytics(analyticsPeriod);
  }, [analyticsPeriod]);

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

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Utilisateurs & activité</h2>
            <p className="text-sm text-slate-600">
              Suivi des inscriptions app et des inscriptions aux événements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["7d", "30d", "90d"] as AnalyticsPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setAnalyticsPeriod(period)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  analyticsPeriod === period
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-700"
                }`}
              >
                {period === "7d" ? "7 jours" : period === "30d" ? "30 jours" : "90 jours"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void loadAnalytics(analyticsPeriod)}
              className="inline-flex w-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => {
                if (!analytics) return;
                const csv = [
                  "date,user_signups,event_registrations",
                  ...analytics.weeklyBuckets.map((bucket) =>
                    `${bucket.date},${bucket.userSignups},${bucket.eventRegistrations}`
                  )
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `analytics-${analyticsPeriod}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="inline-flex w-fit rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Export CSV
            </button>
          </div>
        </div>

        {analyticsLoading ? <LoadingState /> : null}
        {analyticsError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{analyticsError}</p>
        ) : null}

        {!analyticsLoading && !analyticsError && analytics ? (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <KpiCard
                label="Utilisateurs inscrits app"
                value={analytics.totalUsers === null ? "N/A" : analytics.totalUsers.toString()}
                hint={analytics.profilesReadable ? "Total profils" : "Droits lecture profils insuffisants"}
              />
              <KpiCard
                label="Inscriptions événements"
                value={analytics.totalRegisteredToEvents.toString()}
                hint="Statut registered"
              />
              <KpiCard
                label="Utilisateurs actifs événements"
                value={analytics.uniqueUsersRegisteredToEvents.toString()}
                hint="Utilisateurs uniques"
              />
              <KpiCard
                label="Moyenne points"
                value={analytics.averagePoints === null ? "N/A" : analytics.averagePoints.toString()}
                hint="Base 100 + 25 / inscription"
              />
            </div>

            <AnalyticsChart buckets={analytics.weeklyBuckets} />
          </>
        ) : null}
      </section>

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

type KpiCardProps = {
  label: string;
  value: string;
  hint: string;
};

function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{hint}</p>
    </article>
  );
}

type AnalyticsChartProps = {
  buckets: Array<{
    date: string;
    label: string;
    userSignups: number;
    eventRegistrations: number;
  }>;
};

function AnalyticsChart({ buckets }: AnalyticsChartProps) {
  const maxValue = Math.max(
    1,
    ...buckets.flatMap((bucket) => [bucket.userSignups, bucket.eventRegistrations])
  );
  const chartHeight = 220;
  const chartBottom = 176;
  const lineMaxHeight = 145;
  const pointGap = 32;
  const chartWidth = Math.max(560, buckets.length * pointGap + 56);

  const userPoints = buckets.map((bucket, index) => ({
    x: 28 + index * pointGap,
    y: chartBottom - (bucket.userSignups / maxValue) * lineMaxHeight
  }));
  const registrationPoints = buckets.map((bucket, index) => ({
    x: 28 + index * pointGap,
    y: chartBottom - (bucket.eventRegistrations / maxValue) * lineMaxHeight
  }));

  function buildSmoothPath(points: Array<{ x: number; y: number }>) {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const current = points[index];
      const controlX = (previous.x + current.x) / 2;
      d += ` Q ${controlX} ${previous.y}, ${current.x} ${current.y}`;
    }
    return d;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <LegendDot color="#2563eb" label="Inscrits application" />
        <LegendDot color="#16a34a" label="Inscriptions événements" />
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[220px] w-full min-w-[560px]">
          <line x1="20" y1={chartBottom} x2={chartWidth - 16} y2={chartBottom} stroke="#d1d5db" strokeWidth="1" />
          <path d={buildSmoothPath(userPoints)} fill="none" stroke="#2563eb" strokeWidth="3" />
          <path d={buildSmoothPath(registrationPoints)} fill="none" stroke="#16a34a" strokeWidth="3" />
          {buckets.map((bucket, index) => {
            const x = 28 + index * pointGap;
            const usersY = chartBottom - (bucket.userSignups / maxValue) * lineMaxHeight;
            const regsY =
              chartBottom - (bucket.eventRegistrations / maxValue) * lineMaxHeight;

            return (
              <g key={bucket.label}>
                <circle cx={x} cy={usersY} r="3.5" fill="#2563eb" />
                <circle cx={x} cy={regsY} r="3.5" fill="#16a34a" />
                <text x={x} y="198" textAnchor="middle" fontSize="10" fill="#64748b">
                  {bucket.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

type LegendDotProps = {
  color: string;
  label: string;
};

function LegendDot({ color, label }: LegendDotProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  );
}

export default AdminEventsPage;
