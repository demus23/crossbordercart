// components/CapacitorNative.tsx
//
// Native-shell glue code for the Cross Border Cart mobile app (Capacitor).
// This component is a no-op when the site is opened in a normal browser —
// Capacitor.isNativePlatform() only returns true inside the wrapped app —
// so it's safe to mount on every page.
//
// Responsibilities:
//   1. Request notification permission and register the device with FCM,
//      then hand the token to the backend (POST /api/me/push-token) so
//      lib/notifications/sendShipmentNotification knows where to deliver.
//   2. Deep-link notification taps to the relevant shipment/package instead
//      of just opening the app to Home.
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import("@capacitor/browser")

export default function CapacitorNative() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    // Set once listeners are actually attached, so cleanup only tries to
    // remove them if they were added (avoids calling into a plugin module
    // that was never imported when running in a plain browser tab).
    let listenersAttached = false;
    let PushNotificationsRef: typeof import("@capacitor/push-notifications").PushNotifications | null = null;

    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform() || cancelled) return;

      const { PushNotifications } = await import("@capacitor/push-notifications");
      PushNotificationsRef = PushNotifications;

      const permission = await PushNotifications.checkPermissions();
      let granted = permission.receive === "granted";

      if (!granted && permission.receive !== "denied") {
        const req = await PushNotifications.requestPermissions();
        granted = req.receive === "granted";
      }

      if (!granted || cancelled) return;

      await PushNotifications.register();
      if (cancelled) return;

      PushNotifications.addListener("registration", async (token) => {
        try {
          await fetch("/api/me/push-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceToken: token.value,
              platform: Capacitor.getPlatform(), // "ios" | "android"
            }),
          });
        } catch (err) {
          console.error("[push] failed to register device token:", err);
        }
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("[push] registration error:", err);
      });

      // Deep link a notification tap to the relevant shipment, matching the
      // `data` payload shape sent by sendShipmentNotification.ts. This is
      // the same /track/[trackingNo] route used elsewhere in the app (e.g.
      // dashboard/my-shipments.tsx's "Track Shipment" link) — /track.tsx is
      // a different page (a search box keyed on ?no=/?id=/?tracking=, not
      // ?code=), so this must stay a path segment, not a query param.
      PushNotifications.addListener(
  "pushNotificationActionPerformed",
  async (action) => {
       const data = action.notification?.data as
  | {
      event?: string;
      trackingNumber?: string;
      packageTracking?: string;
      checkoutUrl?: string;
    }
  | undefined;

if (!data) return;

// 💳 Payment notification -> open Stripe Checkout
if (data.event === "payment_required" && data.checkoutUrl) {
  const { Browser } = await import("@capacitor/browser");

  await Browser.open({
    url: data.checkoutUrl,
  });

  return;
}

// 📦 Package notification -> My Packages
if (data.packageTracking) {
  router.push("/mypackages");
  return;
}

// 🚚 Shipment status notification -> tracking
if (data.trackingNumber) {
  router.push(`/track/${encodeURIComponent(data.trackingNumber)}`);
}
      });

      listenersAttached = true;
    })();

    return () => {
      cancelled = true;
      if (listenersAttached && PushNotificationsRef) {
        // Removes all listeners registered above. Session changes and hot
        // reloads re-run this effect, so without this, listeners stack up
        // and every push/notification tap fires the stale handlers too.
        PushNotificationsRef.removeAllListeners();
      }
    };
  }, [status, router]);

  return null;
}
