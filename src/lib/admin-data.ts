
'use server';

import { db } from './firebase-admin';
import { FieldValue, type DocumentSnapshot, type Timestamp } from 'firebase-admin/firestore';
import type { QuoteRequest, QuoteStatus } from './data';

const QUOTE_REQUESTS_COLLECTION = 'quoteRequests';
const COUNTERS_COLLECTION = 'counters';
const ADMINS_COLLECTION = 'admins';

// --- Helper Functions ---

// Function to check if a user is an admin.
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const adminDocRef = db.collection(ADMINS_COLLECTION).doc(userId);
    const adminDoc = await adminDocRef.get();
    return adminDoc.exists;
  } catch (error) {
    console.error(`Error checking admin status for user ${userId}:`, error);
    return false;
  }
}

// Sequential ID Generation using native admin SDK syntax
async function getNextQuoteTrackingId(): Promise<string> {
  const counterRef = db.collection(COUNTERS_COLLECTION).doc('quoteCounter');
  try {
    const newNumber = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const lastNumber = counterDoc.exists && counterDoc.data()?.lastNumber ? counterDoc.data()?.lastNumber : 0;
      const newNumber = lastNumber + 1;
      transaction.set(counterRef, { lastNumber: newNumber }, { merge: true });
      return newNumber;
    });
    return `SS-${String(newNumber).padStart(6, '0')}`;
  } catch (e) {
    console.error("Transaction to get next tracking ID failed: ", e);
    // Fallback in case of transaction failure
    return `SS-ERR-${Date.now()}`;
  }
}

// Maps a Firestore document to a QuoteRequest object
const mapDocToQuoteRequest = (docSnap: DocumentSnapshot): QuoteRequest => {
  const data = docSnap.data();
  if (!data) {
    // Handle cases where document exists but has no data.
    // This is unlikely but good practice to handle.
    throw new Error(`Document ${docSnap.id} has no data.`);
  }

  const submittedAtRaw = data.submittedAt as Timestamp | undefined;
  const respondedAtRaw = data.respondedAt as Timestamp | undefined;

  // Convert Firestore Timestamps to JS Date objects safely
  const submittedAt = submittedAtRaw ? submittedAtRaw.toDate() : new Date();
  const respondedAt = respondedAtRaw ? respondedAtRaw.toDate() : undefined;

  return {
    id: docSnap.id,
    trackingId: data.trackingId || '',
    name: data.name || 'Sin Nombre',
    email: data.email || 'Sin Email',
    serviceInterest: data.serviceInterest,
    message: data.message || '',
    submittedAt: submittedAt,
    status: (data.status as QuoteStatus) || 'pendiente',
    adminResponse: data.adminResponse,
    quotedAmount: data.quotedAmount,
    attachmentName: data.attachmentName,
    respondedAt: respondedAt,
    internalNotes: data.internalNotes,
  };
};

// --- CRUD Operations using native Admin SDK syntax ---

// Anyone can add a quote request.
export async function addQuoteRequest(data: Omit<QuoteRequest, 'id' | 'trackingId' | 'submittedAt' | 'status' | 'respondedAt' | 'adminResponse' | 'quotedAmount' | 'attachmentName' | 'internalNotes'>): Promise<{id: string, trackingId: string}> {
  try {
    const trackingId = await getNextQuoteTrackingId();
    const docRef = await db.collection(QUOTE_REQUESTS_COLLECTION).add({
      ...data,
      trackingId: trackingId,
      submittedAt: FieldValue.serverTimestamp(), // Use FieldValue for server-side timestamp
      status: 'pendiente' as QuoteStatus,
    });
    return { id: docRef.id, trackingId };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

// Fetches ALL quote requests, but ONLY if the user is an admin.
export async function getAllQuoteRequests(userId: string): Promise<QuoteRequest[]> {
  const userIsAdmin = await isAdmin(userId);
  if (!userIsAdmin) {
    console.error(`Permission denied: User ${userId} is not an admin.`);
    throw new Error('PERMISSION_ERROR: User does not have sufficient permissions to view quote requests.');
  }

  try {
    const querySnapshot = await db.collection(QUOTE_REQUESTS_COLLECTION).orderBy('submittedAt', 'desc').get();
    return querySnapshot.docs.map(mapDocToQuoteRequest);
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
}

// Gets a specific quote by ID.
export async function getQuoteRequestById(id: string): Promise<QuoteRequest | undefined> {
  try {
    const docRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return mapDocToQuoteRequest(docSnap);
    } else {
      console.log(`Document with ID ${id} not found.`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error getting document by ID ${id}: `, error);
    throw error;
  }
}

// Updates a quote request.
export async function updateQuoteRequest(id: string, updates: Partial<Omit<QuoteRequest, 'id' | 'submittedAt'>>): Promise<QuoteRequest | undefined> {
  try {
    const docRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(id);
    
    const updateData: Record<string, any> = { ...updates };

    // If status is being changed to 'responded', always use the server timestamp for respondedAt.
    if (updates.status === 'respondido' && !updates.respondedAt) {
        updateData.respondedAt = FieldValue.serverTimestamp();
    }

    await docRef.update(updateData);
    return await getQuoteRequestById(id);
  } catch (error) {
    console.error(`Error updating document ${id}: `, error);
    throw error;
  }
}

// Deletes a quote request.
export async function deleteQuoteRequest(id: string): Promise<void> {
  try {
    const docRef = db.collection(QUOTE_REQUESTS_COLLECTION).doc(id);
    await docRef.delete();
  } catch (error) {
    console.error(`Error deleting document ${id}: `, error);
    throw error;
  }
}
