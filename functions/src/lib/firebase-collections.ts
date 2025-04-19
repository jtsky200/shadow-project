import { collection } from 'firebase/firestore';
import { firestore } from './firebase';

// User collections
export const usersCollection = collection(firestore, 'users');
export const getUserDoc = (userId: string) => `users/${userId}`;
export const getUserSettingsCollection = (userId: string) => collection(firestore, `users/${userId}/settings`);

// Document collections
export const documentsCollection = collection(firestore, 'documents');
export const getUserDocumentsCollection = (userId: string) => collection(firestore, `users/${userId}/documents`);

// Chat history collections
export const chatHistoryCollection = collection(firestore, 'chatHistory');
export const getUserChatCollection = (userId: string) => collection(firestore, `users/${userId}/chats`);

// Manual collections
export const manualsCollection = collection(firestore, 'manuals');
export const manualSectionsCollection = (manualId: string) => collection(firestore, `manuals/${manualId}/sections`);

// Troubleshooting collections
export const troubleshootingCollection = collection(firestore, 'troubleshooting');
export const troubleshootingCategoriesCollection = collection(firestore, 'troubleshooting/categories/items');
export const getTroubleshootingIssuesCollection = (categoryId: string) => 
  collection(firestore, `troubleshooting/categories/items/${categoryId}/issues`);

// Library/history collections
export const contentLibraryCollection = collection(firestore, 'contentLibrary');
export const getUserLibraryCollection = (userId: string) => collection(firestore, `users/${userId}/library`);

// System collections
export const systemUpdatesCollection = collection(firestore, 'systemUpdates');
export const vehicleModelsCollection = collection(firestore, 'vehicleModels');
export const specificationsCollection = collection(firestore, 'specifications');

// File storage paths
export const STORAGE_PATHS = {
  MANUALS: 'manuals',
  DOCUMENTS: 'documents',
  USER_DOCUMENTS: (userId: string) => `documents/${userId}`,
  VEHICLES: 'vehicles',
  SYSTEM_UPDATES: 'systemUpdates',
  TROUBLESHOOTING_IMAGES: 'troubleshooting/images',
  CONTENT: 'content'
}; 