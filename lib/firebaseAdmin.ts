// lib/firebaseAdmin.ts
//
// Lazily initializes the Firebase Admin SDK from three environment
// variables (set on the hosting platform — never committed to git):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY
//
// FIREBASE_PRIVATE_KEY needs special handling: most hosting UIs store env
// vars as a single line, so literal "\n" sequences in the pasted key get
// stored as the two characters backslash-n instead of a real newline. We
// unescape them back into real newlines here so the PEM key parses.
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";

export function getFirebaseAdmin(): App {
  const existing = getApps();
  if (existing.length) {
    return existing[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}
