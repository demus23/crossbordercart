// lib/clarity.ts
// Small helper for firing Microsoft Clarity custom events from anywhere
// in the app. Safe to call even if Clarity hasn't loaded yet (e.g. ad
// blockers, or NEXT_PUBLIC_CLARITY_ID not set) — it just no-ops.

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Fire a custom Clarity event so it shows up as a filterable tag on
 * session recordings (Clarity dashboard -> Recordings -> filter by
 * "Smart Event" / custom event name).
 *
 * Example: trackClarityEvent("whatsapp_click_footer")
 */
export function trackClarityEvent(eventName: string) {
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}
