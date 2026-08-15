# Cross Border Cart mobile app — setup

This folder is the Capacitor native shell. It doesn't contain the app's UI —
it loads `https://www.crossbordercart.com` directly (see `capacitor.config.ts`),
so the website and the app are always the same code. What lives here is just
the native project wrapper, push notification plugin, and store config.

The actual push-notification client code lives in the website repo now:
`components/CapacitorNative.tsx`, mounted from `pages/_app.tsx`. That's what
registers the device with FCM and calls `POST /api/me/push-token`.

## 1. Install dependencies

```bash
cd mobile
npm install
```

## 2. Add the native platforms

```bash
npm run add:android   # requires Android Studio + Android SDK installed
npm run add:ios        # requires a Mac with Xcode — see note below
```

This generates `android/` and `ios/` folders with real native Xcode/Android
Studio projects. They're not included here since they're large, generated,
and platform-specific — this is the normal Capacitor workflow, not something
skipped.

**iOS note:** building and submitting to the App Store requires a Mac (Xcode
only runs on macOS) or a cloud Mac build service (e.g. Codemagic, Ionic
Appflow, GitHub Actions macOS runners). If you're on Windows, Android can be
built and tested locally, but iOS will need one of those — worth deciding
which before Phase 2 wraps up, since it's on the critical path for the Apple
submission in the app plan.

## 3. Every time the config changes

```bash
npm run sync   # npx cap sync — copies config/plugin changes into android/ and ios/
```

## 4. Open in the native IDE to build/run

```bash
npm run open:android   # opens Android Studio
npm run open:ios        # opens Xcode (Mac only)
```

From there, Run on a simulator/device like any native app — it'll load the
live crossbordercart.com site inside the wrapper.

## 5. Firebase (needed before push notifications work)

See `FIREBASE_SETUP.md` in the project root for exact steps. Once you have:
- `google-services.json` → drop it into `android/app/`
- `GoogleService-Info.plist` → drop it into `ios/App/App/` (via Xcode, "Add Files")
- an APNs auth key uploaded to your Firebase project (iOS push requires this)

...and set `FIREBASE_PROJECT_ID` (plus the Firebase Admin SDK service account
credentials) in the website's environment variables, the notification stub in
`lib/notifications/sendShipmentNotification.ts` is ready to have its
commented-out real implementation switched on.

## What's still manual / not yet built here

- Native tab bar (Home / Packages / Shipments / Track / Account). Wiring a
  genuinely native tab bar around a remote-URL webview means either a
  Capacitor community plugin (e.g. `@capacitor-community/bottom-tabs` or
  similar) or hand-written native code per platform — that needs to happen
  inside the generated `android/` and `ios/` projects after step 2 above,
  where it can actually be built and tested. Flagging this now rather than
  shipping unverified native code blind.
- App icon and splash screen image assets (currently just a background
  color in `capacitor.config.ts` — swap in real artwork before submitting).
- In-app browser routing for external links (WhatsApp, Stripe redirects) —
  add `@capacitor/browser` and use it in place of `window.open` for external
  URLs in the website, so users aren't kicked out to the OS browser (this is
  one of the things Apple's Guideline 4.2 review looks for).
