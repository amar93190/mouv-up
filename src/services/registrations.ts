import { supabase } from "../lib/supabase";
import { EventRegistration, EventRegistrationWithEvent } from "../types/domain";
import { normalizeArrowSymbols } from "../utils/textSymbols";

export async function fetchRegistrationByEvent(userId: string, eventId: string) {
  const { data, error } = await supabase
    .from("event_registrations")
    .select("id,user_id,event_id,registration_status,created_at")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as EventRegistration | null) ?? null;
}

export async function registerToEvent(userId: string, eventId: string) {
  const { data, error } = await supabase
    .from("event_registrations")
    .upsert(
      {
        user_id: userId,
        event_id: eventId,
        registration_status: "registered"
      },
      { onConflict: "user_id,event_id" }
    )
    .select("id,user_id,event_id,registration_status,created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as EventRegistration;
}

export async function cancelRegistration(registrationId: string) {
  const { data, error } = await supabase
    .from("event_registrations")
    .update({ registration_status: "cancelled" })
    .eq("id", registrationId)
    .select("id,user_id,event_id,registration_status,created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as EventRegistration;
}

export async function fetchMyRegistrations(userId: string) {
  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      "id,user_id,event_id,registration_status,created_at,events(id,title,slug,start_date,end_date,location,is_published)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const normalized = (data ?? [])
    .map((item) => {
      const eventRecord = Array.isArray(item.events) ? item.events[0] : item.events;

      if (!eventRecord) return null;

      return {
        ...item,
        events: {
          ...eventRecord,
          title: normalizeArrowSymbols(eventRecord.title),
          location: normalizeArrowSymbols(eventRecord.location)
        }
      };
    })
    .filter(Boolean);

  return normalized as EventRegistrationWithEvent[];
}
