import { EventItem, EventRegistration } from "../types/domain";

const makeWebhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;

type WelcomeRegistrationPayload = {
  userId: string;
  event: EventItem;
  registration: EventRegistration;
  source: "event-detail" | "program-modal";
};

export async function sendWelcomeRegistrationAutomation(payload: WelcomeRegistrationPayload) {
  if (!makeWebhookUrl) return;

  try {
    const response = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: payload.userId,
        event_id: payload.event.id,
        registration_id: payload.registration.id,
        registration_status: payload.registration.registration_status,
        event_title: payload.event.title,
        event_slug: payload.event.slug,
        event_start_date: payload.event.start_date,
        event_end_date: payload.event.end_date,
        event_location: payload.event.location,
        source: payload.source,
        sent_at: new Date().toISOString()
      }),
      keepalive: true
    });

    if (!response.ok) {
      throw new Error(`Make webhook failed: ${response.status}`);
    }
  } catch (error) {
    // Do not break registration flow if automation fails.
    console.error("[automation] welcome registration webhook error", error);
  }
}
