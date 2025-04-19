import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Create mock implementations for Firebase services
const mockAdminDb = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => ({}),
      update: async () => ({}),
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({ get: async () => ({ docs: [] }) }),
  }),
};

const mockAdminStorage = {
  file: () => ({
    save: async () => ({}),
    getSignedUrl: async () => ['https://example.com/mock-url'],
    delete: async () => ({}),
  }),
  upload: async () => ({}),
};

// Initialize variables for Firebase services
let adminDb;
let adminStorage;
let isInitialized = false;

// Initialize Firebase Admin SDK only if it hasn't been initialized
if (!getApps().length) {
  try {
    let credential;
    
    // Check if we have a service account key in environment variables (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        // Parse the JSON string from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
      } catch (parseError) {
        console.error('Error parsing Firebase service account JSON:', parseError);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
      }
    } else {
      // For local development, use the file path with a fallback
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/shadow2-eb47f-firebase-adminsdk-fbsvc-a1edc984b1.json';
      try {
        credential = admin.credential.cert(serviceAccountPath);
      } catch (fileError) {
        console.error('Error loading Firebase service account file:', fileError);
        throw new Error(`Could not load Firebase credentials from: ${serviceAccountPath}`);
      }
    }
    
    // Check if we have the storage bucket configured
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
                         "shadow2-eb47f.firebasestorage.app";
    
    admin.initializeApp({
      credential: credential,
      storageBucket: storageBucket
    });
    
    // Get Firestore and Storage instances
    adminDb = admin.firestore();
    adminStorage = admin.storage().bucket();
    isInitialized = true;
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // In production, we might want to handle this error differently
    if (process.env.NODE_ENV === 'production') {
      console.error('Firebase Admin SDK initialization failed in production!');
      console.log('Using mock Firebase services for build process');
      
      // Use mock implementations
      adminDb = mockAdminDb;
      adminStorage = mockAdminStorage;
    }
  }
} else {
  // If already initialized, get the instances
  try {
    adminDb = admin.firestore();
    adminStorage = admin.storage().bucket();
    isInitialized = true;
  } catch (error) {
    console.error('Error getting Firebase services:', error);
    adminDb = mockAdminDb;
    adminStorage = mockAdminStorage;
  }
}

export { admin, adminDb, adminStorage, isInitialized }; 