import { EventItem } from "../types/domain";

export type HomeEventMode =
  | { type: "active"; event: EventItem }
  | { type: "countdown"; event: EventItem; daysRemaining: number }
  | { type: "normal" };

export function getHomeEventMode(events: EventItem[], now = new Date()): HomeEventMode {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const activeEvent = sorted.find((event) => {
    const start = new Date(event.start_date).getTime();
    const end = new Date(event.end_date).getTime();
    const current = now.getTime();

    return current >= start && current <= end;
  });

  if (activeEvent) {
    return { type: "active", event: activeEvent };
  }

  const nextEvent = sorted.find((event) => new Date(event.start_date).getTime() > now.getTime());

  if (!nextEvent) {
    return { type: "normal" };
  }

  const milliseconds = new Date(nextEvent.start_date).getTime() - now.getTime();
  const daysRemaining = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));

  return {
    type: "countdown",
    event: nextEvent,
    daysRemaining: Math.max(daysRemaining, 0)
  };
}
