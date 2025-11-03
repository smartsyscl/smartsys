
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// --- IMPORTANT: This file is for SERVER-SIDE use only. ---
// It uses a service account for privileged access to Firebase services.
// NEVER expose the service account key to the client.

// Check if the service account JSON is provided as an environment variable
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  // This error will be caught during the build process or at runtime on the server,
  // preventing the app from running in a misconfigured state.
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. This is required for server-side admin operations.');
}

// Parse the service account key from the environment variable.
const parsedServiceAccount = JSON.parse(
    Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
);

// Initialize the Admin App if it hasn't been already
let adminApp: admin.app.App;
if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(parsedServiceAccount),
  });
} else {
  adminApp = admin.app();
}

const db = getFirestore(adminApp);

// Note: Resend logic has been moved to the specific API route that handles email sending.
// This keeps this file focused on Firebase Admin initialization.

export { adminApp, db };
