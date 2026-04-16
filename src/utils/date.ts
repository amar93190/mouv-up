export function toLocalDateTimeInputValue(isoDate: string) {
  if (!isoDate) return "";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
}

export function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

export function buildCountdownLabel(days: number) {
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Dans 1 jour";
  return `Dans ${days} jours`;
}
