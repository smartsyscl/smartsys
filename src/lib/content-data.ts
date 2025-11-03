
'use server';

import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Service, PortfolioItem, Testimonial } from './data';

export async function getServices(): Promise<Service[]> {
  try {
    const servicesCol = collection(db, 'services');
    const q = query(servicesCol, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.warn("La colección 'services' está vacía. Ejecuta el sembrado de datos.");
      return [];
    }
    const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[];
    return servicesData;
  } catch (error) {
    console.error("Error fetching services:", error);
    if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('missing or insufficient permissions'))) {
        console.error("Firestore permission error in getServices. Check your security rules to allow public read access for the 'services' collection.");
    }
    return []; // Return empty array on error to prevent crashes
  }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const portfolioCol = collection(db, 'portfolio');
    const q = query(portfolioCol, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        console.warn("La colección 'portfolio' está vacía. Ejecuta el sembrado de datos.");
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PortfolioItem[];
  } catch (error) {
    console.error("Error fetching portfolio items:", error);
    if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('missing or insufficient permissions'))) {
        console.error("Firestore permission error in getPortfolioItems. Check your security rules to allow public read access for the 'portfolio' collection.");
    }
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonialsCol = collection(db, 'testimonials');
    const q = query(testimonialsCol, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
     if (snapshot.empty) {
        console.warn("La colección 'testimonials' está vacía. Ejecuta el sembrado de datos.");
        return [];
    }
    const testimonialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Testimonial[];
    return testimonialsData;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('missing or insufficient permissions'))) {
        console.error("Firestore permission error in getTestimonials. Check your security rules to allow public read access for the 'testimonials' collection.");
    }
    return [];
  }
}
