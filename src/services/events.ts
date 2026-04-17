import { supabase } from "../lib/supabase";
import { EventItem, EventWriteInput } from "../types/domain";
import { normalizeArrowSymbols } from "../utils/textSymbols";

const EVENT_SELECT =
  "id,title,slug,short_description,long_description,start_date,end_date,location,cover_image,is_published,is_main_event,created_by,organization_id,created_at,updated_at";
const FESTIVAL_EVENT_SELECT =
  "id,title,slug,short_description,long_description,start_date,end_date,location,cover_image,is_published,is_main_event,created_by,organization_id,created_at,updated_at";

function normalizeEventText(event: EventItem): EventItem {
  return {
    ...event,
    title: normalizeArrowSymbols(event.title),
    short_description: normalizeArrowSymbols(event.short_description),
    long_description: normalizeArrowSymbols(event.long_description),
    location: normalizeArrowSymbols(event.location)
  };
}

export async function fetchPublicEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("is_published", true)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as EventItem[]).map(normalizeEventText);
}

export async function fetchPublicFestivalEvents() {
  const { data, error } = await supabase
    .from("festival_events")
    .select(FESTIVAL_EVENT_SELECT)
    .eq("is_published", true)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as EventItem[]).map(normalizeEventText);
}

export async function fetchPublicMainEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("is_published", true)
    .eq("is_main_event", true)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as EventItem[]).map(normalizeEventText);
}

export async function fetchPublicFestivalMainEvents() {
  const { data, error } = await supabase
    .from("festival_events")
    .select(FESTIVAL_EVENT_SELECT)
    .eq("is_published", true)
    .eq("is_main_event", true)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as EventItem[]).map(normalizeEventText);
}

export async function fetchPublicEventBySlug(slug: string) {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeEventText(data as EventItem) : null;
}

export async function fetchAdminEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as EventItem[]).map(normalizeEventText);
}

export async function fetchAdminEventById(eventId: string) {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeEventText(data as EventItem) : null;
}

export async function createEvent(input: EventWriteInput, createdBy: string) {
  const { data, error } = await supabase
    .from("events")
    .insert({ ...input, created_by: createdBy })
    .select(EVENT_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return normalizeEventText(data as EventItem);
}

export async function updateEvent(eventId: string, input: EventWriteInput) {
  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", eventId)
    .select(EVENT_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return normalizeEventText(data as EventItem);
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
}
