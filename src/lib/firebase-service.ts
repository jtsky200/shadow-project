import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from './firebase';
import * as collections from './firebase-collections';

// Type definitions
export interface Manual {
  id: string;
  title: string;
  description: string;
  fileSize: string;
  pages: number;
  year: string;
  model: string;
  path: string;
  downloadPath: string;
  label?: string;
  labelColor?: string;
  documentType: "manual" | "specification" | "quickstart";
  createdAt: Date;
  updatedAt: Date;
}

export interface TroubleshootingCategory {
  id: string;
  title: string;
  icon: string;
  order: number;
}

export interface TroubleshootingIssue {
  id: string;
  title: string;
  description?: string;
  solutions: string[];
  categoryId: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  fontSize: number;
  defaultModel: string;
  notifications: boolean;
  userId: string;
  temperature?: number;
  streaming?: boolean;
}

export interface UserDocument {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
  userId?: string;
}

export interface LibraryItem {
  id: string;
  type: string;
  title: string;
  date: Date;
  tags: string[];
  preview: unknown;
  favorite: boolean;
  userId: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date;
}

// ===== Manuals Service =====
export const manualsService = {
  // Get all manuals
  async getAllManuals(): Promise<Manual[]> {
    try {
      const snapshot = await getDocs(query(
        collections.manualsCollection,
        orderBy('createdAt', 'desc')
      ));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Manual));
    } catch (error) {
      console.error('Error fetching manuals:', error);
      return [];
    }
  },
  
  // Get manual by ID
  async getManualById(id: string): Promise<Manual | null> {
    try {
      const docRef = doc(firestore, `manuals/${id}`);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Manual;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching manual with id ${id}:`, error);
      return null;
    }
  },
  
  // Get manuals by model
  async getManualsByModel(model: string): Promise<Manual[]> {
    try {
      const q = query(
        collections.manualsCollection,
        where('model', '==', model),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Manual));
    } catch (error) {
      console.error(`Error fetching manuals for model ${model}:`, error);
      return [];
    }
  }
};

// ===== Troubleshooting Service =====
const troubleshootingService = {
  // Get all categories
  async getAllCategories(): Promise<TroubleshootingCategory[]> {
    try {
      const snapshot = await getDocs(query(
        collections.troubleshootingCategoriesCollection,
        orderBy('order', 'asc')
      ));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TroubleshootingCategory));
    } catch (error) {
      console.error('Error fetching troubleshooting categories:', error);
      return [];
    }
  },
  
  // Get issues by category
  async getIssuesByCategory(categoryId: string): Promise<TroubleshootingIssue[]> {
    try {
      const issuesCollection = collections.getTroubleshootingIssuesCollection(categoryId);
      const snapshot = await getDocs(issuesCollection);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        categoryId
      } as TroubleshootingIssue));
    } catch (error) {
      console.error(`Error fetching issues for category ${categoryId}:`, error);
      return [];
    }
  }
};

export { troubleshootingService };

// ===== User Settings Service =====
export const userSettingsService = {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const docRef = doc(firestore, `users/${userId}/settings/preferences`);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return {
          userId,
          ...snapshot.data()
        } as UserSettings;
      }
      
      // Return default settings if none exist
      return {
        userId,
        theme: 'system',
        fontSize: 16,
        defaultModel: 'gpt-4',
        notifications: true
      };
    } catch (error) {
      console.error(`Error fetching settings for user ${userId}:`, error);
      return null;
    }
  },
  
  // Save user settings
  async saveUserSettings(settings: UserSettings): Promise<boolean> {
    try {
      const { userId, ...data } = settings;
      const docRef = doc(firestore, `users/${userId}/settings/preferences`);
      
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }
};

// ===== Documents Service =====
export const documentsService = {
  // Get all documents
  async getAllDocuments(): Promise<UserDocument[]> {
    try {
      const snapshot = await getDocs(query(
        collections.documentsCollection,
        orderBy('createdAt', 'desc')
      ));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      } as UserDocument));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },
  
  // Get user documents
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    try {
      const userDocsCollection = collections.getUserDocumentsCollection(userId);
      const snapshot = await getDocs(query(
        userDocsCollection,
        orderBy('createdAt', 'desc')
      ));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      } as UserDocument));
    } catch (error) {
      console.error(`Error fetching documents for user ${userId}:`, error);
      return [];
    }
  },
  
  // Add document
  async addDocument(document: Omit<UserDocument, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(collections.documentsCollection, {
        ...document,
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  },
  
  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestore, `documents/${id}`));
      return true;
    } catch (error) {
      console.error(`Error deleting document with id ${id}:`, error);
      return false;
    }
  }
};

// ===== Library/Content History Service =====
export const libraryService = {
  // Get user library items
  async getUserLibraryItems(userId: string): Promise<LibraryItem[]> {
    try {
      const libraryCollection = collections.getUserLibraryCollection(userId);
      const snapshot = await getDocs(query(
        libraryCollection,
        orderBy('date', 'desc')
      ));
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      } as LibraryItem));
    } catch (error) {
      console.error(`Error fetching library items for user ${userId}:`, error);
      return [];
    }
  },
  
  // Add library item
  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<string | null> {
    try {
      const { userId } = item;
      const libraryCollection = collections.getUserLibraryCollection(userId);
      
      const docRef = await addDoc(libraryCollection, {
        ...item,
        date: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding library item:', error);
      return null;
    }
  },
  
  // Toggle favorite status
  async toggleFavorite(userId: string, itemId: string, isFavorite: boolean): Promise<boolean> {
    try {
      const docRef = doc(firestore, `users/${userId}/library/${itemId}`);
      await updateDoc(docRef, { favorite: isFavorite });
      return true;
    } catch (error) {
      console.error(`Error toggling favorite status for item ${itemId}:`, error);
      return false;
    }
  },
  
  // Delete library item
  async deleteLibraryItem(userId: string, itemId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestore, `users/${userId}/library/${itemId}`));
      return true;
    } catch (error) {
      console.error(`Error deleting library item ${itemId}:`, error);
      return false;
    }
  }
};

// ===== File Upload Service =====
export const fileService = {
  // Client-side upload file to Firebase Storage
  async uploadFile(
    file: File, 
    path: string
  ): Promise<string> {
    const storageRef = ref(storage, path);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytes(storageRef, file);
      
      uploadTask
        .then(async (snapshot) => {
          // Get download URL after upload completes
          const downloadURL = await getDownloadURL(snapshot.ref);
          resolve(downloadURL);
        })
        .catch((error) => {
          console.error('Upload error:', error);
          reject(error);
        });
    });
  },
  
  // Server-side upload through API endpoint (more secure)
  async uploadFileViaApi(file: File): Promise<{ url: string; path: string; }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { 
        url: result.url, 
        path: result.path 
      };
    } catch (error) {
      console.error('Error uploading file via API:', error);
      throw error;
    }
  },
  
  // Delete file from Firebase Storage
  async deleteFile(path: string): Promise<boolean> {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error(`Error deleting file at path ${path}:`, error);
      return false;
    }
  }
};

// ===== Chat Service =====
export const chatService = {
  // Save chat messages to Firestore
  async saveChatMessages(sessionId: string, messages: ChatMessage[]): Promise<boolean> {
    try {
      // Call our API endpoint to save the chat using Firebase Admin SDK
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messages,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error saving chat: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving chat messages:', error);
      return false;
    }
  },
  
  // Get chat history from Firestore
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const docRef = doc(firestore, `cadillac-chat/${sessionId}`);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return data.messages || [];
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching chat history for session ${sessionId}:`, error);
      return [];
    }
  }
};

// Export a default service object that combines all services
const services = {
  manuals: manualsService,
  troubleshooting: troubleshootingService,
  userSettings: userSettingsService,
  documents: documentsService,
  library: libraryService,
  files: fileService,
  chat: chatService
};

export { services }; 