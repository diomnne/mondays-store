/** Dates are stored in UTC and always shown in Philippine time. */
const dateTimeFormat = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

const longDateTimeFormat = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

/** "Nov 6, 2026, 10:42 AM" */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** "November 6, 2026 at 10:42 AM" */
export function formatLongDateTime(iso: string): string {
  return longDateTimeFormat.format(new Date(iso));
}
