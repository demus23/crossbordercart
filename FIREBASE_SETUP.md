# Firebase project setup for push notifications

Cross Border Cart doesn't have a Firebase project yet. These are the exact
steps to create one and get the credentials the app needs. Budget about
20–30 minutes, most of it waiting on file downloads and console pages to load.

## 1. Create the project

1. Go to https://console.firebase.google.com and sign in with the Google
   account you want to own this (a dedicated business Google account is
   better than a personal one, if you have one for CBC).
2. Click **Add project**.
3. Name it something like `cross-border-cart` and continue through the
   prompts (Google Analytics for the project is optional — skip it, not
   needed for push notifications).
4. Click **Create project** and wait for it to finish provisioning.

## 2. Register the Android app

1. In the Firebase console, on the project overview page, click the
   **Android icon** to add an Android app.
2. **Android package name**: enter `com.crossbordercart.app` — this must
   exactly match `appId` in `mobile/capacitor.config.ts`.
3. App nickname: anything, e.g. "Cross Border Cart Android".
4. SHA-1 certificate: skip for now (only needed later for Google Sign-In,
   not for push notifications).
5. Click **Register app**, then **download `google-services.json`**.
6. Keep that file — it goes into `mobile/android/app/` once you've run
   `npm run add:android` (step 2 of `SETUP.md`).

## 3. Register the iOS app

1. Back on the project overview page, click the **iOS icon** to add an iOS app.
2. **iOS bundle ID**: enter `com.crossbordercart.app` — same as the Android
   package name, must match `appId` in `capacitor.config.ts`.
3. App nickname: e.g. "Cross Border Cart iOS".
4. Click **Register app**, then **download `GoogleService-Info.plist`**.
5. Keep that file — it goes into `mobile/ios/App/App/` (added via Xcode)
   once you've run `npm run add:ios` (requires a Mac — see `SETUP.md`).

## 4. Enable Cloud Messaging

1. In the Firebase console left sidebar, go to **Project settings** (gear
   icon) → **Cloud Messaging** tab.
2. Cloud Messaging is enabled by default on new projects — you shouldn't
   need to do anything here except note the **Sender ID**, which you may
   want later.

## 5. Create an APNs auth key (required for iOS push — Android doesn't need this)

Apple push notifications go through Apple's own push service (APNs), and
Firebase needs a key from your Apple Developer account to relay to it.

1. You'll need an active Apple Developer Program membership ($99/year — see
   the app plan doc) before this step is possible.
2. Go to https://developer.apple.com/account → **Certificates, IDs & Profiles**
   → **Keys** → click **+** to create a new key.
3. Name it e.g. "CBC Push Notifications", check **Apple Push Notifications
   service (APNs)**, then **Continue** → **Register**.
4. Download the `.p8` key file **immediately** — Apple only lets you download
   it once. Note the **Key ID** shown on the same page.
5. Also note your **Team ID**, visible in the top-right of the Apple
   Developer account page (or under Membership details).
6. Back in Firebase console → **Project settings** → **Cloud Messaging** tab
   → under **Apple app configuration**, upload the `.p8` file along with the
   Key ID and Team ID from the previous steps.

## 6. Get server credentials for the backend

The website's backend (not the app) needs to be able to send pushes via
Firebase Admin SDK. This is separate from the two files above.

1. Firebase console → **Project settings** → **Service accounts** tab.
2. Click **Generate new private key** → confirm → a JSON file downloads.
3. This file contains a private key — treat it like a password. Do not
   commit it to git.
4. Set these in the website's environment variables (wherever
   `.env.local` / `.env.production` / Vercel env vars are managed):
   - `FIREBASE_PROJECT_ID` — from the JSON file's `project_id`
   - `FIREBASE_CLIENT_EMAIL` — from the JSON file's `client_email`
   - `FIREBASE_PRIVATE_KEY` — from the JSON file's `private_key` (when
     pasting into a `.env` file, keep it as one line with `\n` for
     newlines, or check how your hosting provider handles multiline
     secrets)

Once `FIREBASE_PROJECT_ID` is set, `lib/notifications/sendShipmentNotification.ts`
will stop logging to the console and needs its commented-out
`firebase-admin` block uncommented (plus `npm install firebase-admin` on the
website) to actually send.

## Summary of what goes where

| Credential | Goes in | Used by |
|---|---|---|
| `google-services.json` | `mobile/android/app/` | Android app build |
| `GoogleService-Info.plist` | `mobile/ios/App/App/` | iOS app build |
| APNs `.p8` key + Key ID + Team ID | Firebase console (uploaded there, not stored in the repo) | Firebase relaying to Apple |
| Service account JSON → env vars | Website's environment variables | Backend sending pushes via `sendShipmentNotification.ts` |
