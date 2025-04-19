// This is a mock implementation of the Firebase collections
// It doesn't actually connect to Firebase, just provides the expected interface

// Mock collection reference creator
const createCollection = (name: string) => ({ id: name, path: name });
const createSubcollection = (parentPath: string, name: string) => ({ 
  id: name, 
  path: `${parentPath}/${name}` 
});

// Create mock collections
export const users = createCollection('users');
export const manuals = createCollection('manuals');
export const chats = createCollection('chats');
export const documents = createCollection('documents');
export const troubleshooting = createCollection('troubleshooting');
export const settings = createCollection('settings');
export const uploads = createCollection('uploads');
export const chatHistory = createCollection('chat-history');

// Mock collection functions
export const usersCollection = createCollection('users');
export const getUserDoc = (userId: string) => `users/${userId}`;
export const getUserSettingsCollection = (userId: string) => 
  createSubcollection(`users/${userId}`, 'settings');

// User subcollections helpers
export const getUserDocumentsCollection = (userId: string) => 
  createSubcollection(`users/${userId}`, 'documents');

export const getUserChatCollection = (userId: string) => 
  createSubcollection(`users/${userId}`, 'chats');

// Manual collections
export const manualSectionsCollection = (manualId: string) => 
  createSubcollection(`manuals/${manualId}`, 'sections');

// Troubleshooting collections
export const troubleshootingCategoriesCollection = 
  createSubcollection('troubleshooting', 'categories');

export const getTroubleshootingIssuesCollection = (categoryId: string) =>
  createSubcollection(`troubleshooting/categories/${categoryId}`, 'issues');

// Library/history collections
export const contentLibraryCollection = createCollection('contentLibrary');
export const getUserLibraryCollection = (userId: string) => 
  createSubcollection(`users/${userId}`, 'library');

// System collections
export const systemUpdatesCollection = createCollection('systemUpdates');
export const vehicleModelsCollection = createCollection('vehicleModels');
export const specificationsCollection = createCollection('specifications');

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