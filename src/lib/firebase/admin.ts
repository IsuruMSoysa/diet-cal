import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Important for multiline key
    }),
    // Optionally: databaseURL
  });
}

export const adminAuth = admin.auth();

// Initialize Firestore Admin
export const adminFirestore = admin.firestore();
