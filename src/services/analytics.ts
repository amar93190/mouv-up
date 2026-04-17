import { supabase } from "../lib/supabase";

type WeeklyBucket = {
  label: string;
  userSignups: number;
  eventRegistrations: number;
  date: string;
};

export type AdminUserAnalytics = {
  totalUsers: number | null;
  totalRegisteredToEvents: number;
  uniqueUsersRegisteredToEvents: number;
  averagePoints: number | null;
  weeklyBuckets: WeeklyBucket[];
  profilesReadable: boolean;
};

export type AnalyticsPeriod = "7d" | "30d" | "90d";

type ProfileLite = {
  id: string;
  created_at: string;
};

type RegistrationLite = {
  user_id: string;
  created_at: string;
};

function startOfUtcDay(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysForPeriod(period: AnalyticsPeriod) {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  return 90;
}

function buildPeriodBuckets(period: AnalyticsPeriod) {
  const days = daysForPeriod(period);
  const start = startOfUtcDay(new Date());
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const buckets = Array.from({ length: days }).map((_, index) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + index);
    const date = d.toISOString().slice(0, 10);
    return {
      start: d,
      key: date,
      date,
      label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      userSignups: 0,
      eventRegistrations: 0
    };
  });

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  return { buckets, byKey, firstWeekStart: buckets[0].start };
}

function weekKeyFromDate(dateString: string) {
  return new Date(dateString).toISOString().slice(0, 10);
}

export async function fetchAdminUserAnalytics(period: AnalyticsPeriod = "30d"): Promise<AdminUserAnalytics> {
  const { buckets, byKey, firstWeekStart } = buildPeriodBuckets(period);
  const firstWeekIso = firstWeekStart.toISOString();

  const [
    profilesCountResult,
    profilesRecentResult,
    registeredCountResult,
    registeredAllResult,
    registeredRecentResult
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id,created_at").gte("created_at", firstWeekIso),
    supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("registration_status", "registered"),
    supabase.from("event_registrations").select("user_id,created_at").eq("registration_status", "registered"),
    supabase
      .from("event_registrations")
      .select("user_id,created_at")
      .eq("registration_status", "registered")
      .gte("created_at", firstWeekIso)
  ]);

  const profilesReadable = !profilesCountResult.error && !profilesRecentResult.error;

  if (registeredCountResult.error) throw new Error(registeredCountResult.error.message);
  if (registeredAllResult.error) throw new Error(registeredAllResult.error.message);
  if (registeredRecentResult.error) throw new Error(registeredRecentResult.error.message);

  const registrationsAll = (registeredAllResult.data ?? []) as RegistrationLite[];
  const registrationsRecent = (registeredRecentResult.data ?? []) as RegistrationLite[];

  for (const row of registrationsRecent) {
    const key = weekKeyFromDate(row.created_at);
    const bucket = byKey.get(key);
    if (bucket) bucket.eventRegistrations += 1;
  }

  let totalUsers: number | null = null;
  let averagePoints: number | null = null;

  if (profilesReadable) {
    const profilesCount = profilesCountResult.count ?? 0;
    totalUsers = profilesCount;

    const profilesRecent = (profilesRecentResult.data ?? []) as ProfileLite[];
    for (const profile of profilesRecent) {
      const key = weekKeyFromDate(profile.created_at);
      const bucket = byKey.get(key);
      if (bucket) bucket.userSignups += 1;
    }

    if (profilesCount > 0) {
      const registrationsByUser = registrationsAll.reduce<Map<string, number>>((acc, row) => {
        acc.set(row.user_id, (acc.get(row.user_id) ?? 0) + 1);
        return acc;
      }, new Map());

      let totalPoints = profilesCount * 100;
      for (const count of registrationsByUser.values()) {
        totalPoints += count * 25;
      }

      averagePoints = Math.round(totalPoints / profilesCount);
    }
  }

  return {
    totalUsers,
    totalRegisteredToEvents: registeredCountResult.count ?? 0,
    uniqueUsersRegisteredToEvents: new Set(registrationsAll.map((row) => row.user_id)).size,
    averagePoints,
    weeklyBuckets: buckets.map(({ date, label, userSignups, eventRegistrations }) => ({
      date,
      label,
      userSignups,
      eventRegistrations
    })),
    profilesReadable
  };
}
