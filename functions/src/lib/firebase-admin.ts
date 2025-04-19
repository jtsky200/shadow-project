import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK only if it hasn't been initialized
if (!getApps().length) {
  try {
    let credential;
    
    // Check if we have a service account key in environment variables (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Parse the JSON string from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    } else {
      // For local development, use the file path
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/shadow2-eb47f-firebase-adminsdk-fbsvc-a1edc984b1.json';
      credential = admin.credential.cert(serviceAccountPath);
    }
    
    admin.initializeApp({
      credential: credential,
      storageBucket: "shadow2-eb47f.firebasestorage.app"
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

// Get Firestore and Storage instances
const adminDb = admin.firestore();
const adminStorage = admin.storage().bucket();

export { admin, adminDb, adminStorage }; 