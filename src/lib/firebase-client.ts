
'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache, type Firestore }from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { collection, onSnapshot, query, type Unsubscribe, type Timestamp, orderBy } from 'firebase/firestore';
import type { QuoteRequest } from './data';


// Fallback configuration for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAOjXv-kgAKY9lIKf8WQKmr8_LFfuODsvc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smartsys-digital-solutions.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smartsys-digital-solutions",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smartsys-digital-solutions.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1081527780672",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1081527780672:web:fcae6938c0357bbcf366a5"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Use memoryLocalCache to avoid persistence conflicts with SSR if necessary.
  // This is often better for apps with server-side logic and real-time updates.
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

auth = getAuth(app);

export { db, app, auth };

/**
 * Helper function to listen to real-time updates from the quoteRequests collection.
 * This should be used on the client-side within a useEffect hook.
 *
 * @param callback - A function that will be called with the new list of quotes.
 * @returns An unsubscribe function to clean up the listener.
 */
export const listenToQuoteRequests = (
  callback: (quotes: QuoteRequest[], error?: string) => void
): Unsubscribe => {
    const q = query(collection(db, 'quoteRequests'), orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const quotes: QuoteRequest[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const submittedAtRaw = data.submittedAt as Timestamp | undefined;
            const respondedAtRaw = data.respondedAt as Timestamp | undefined;

            quotes.push({
                id: doc.id,
                ...data,
                submittedAt: submittedAtRaw ? submittedAtRaw.toDate() : new Date(),
                respondedAt: respondedAtRaw ? respondedAtRaw.toDate() : undefined,
            } as QuoteRequest);
        });
        callback(quotes);
    }, (error) => {
        console.error("Error listening to quote requests:", error);
        if (error.code === 'permission-denied') {
            console.error("Firestore permission denied. Check security rules to ensure admins can read 'quoteRequests'.");
            callback([], 'PERMISSION_ERROR');
        } else {
            callback([], error.message);
        }
    });

    return unsubscribe;
};

    