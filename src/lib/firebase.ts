
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// --- IMPORTANT: PRODUCTION SETUP ---
// For production, it is STRONGLY recommended to use environment variables
// to store your Firebase configuration. This prevents exposing your keys in the source code.
//
// 1. Create a file named `.env.local` in the root of your project.
// 2. Add your Firebase keys to `.env.local` like this, replacing the values:
//
//    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
//    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
//    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
//    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
//    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
//
// 3. The code below will automatically use these variables if they exist.
//
// These fallback values are placeholders and for development convenience.
// They must be replaced with your actual project's configuration for the app to work.
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

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

export { db, app, auth };
