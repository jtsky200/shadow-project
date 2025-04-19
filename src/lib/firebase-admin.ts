// This is a temporary mock implementation of the Firebase Admin SDK
// It provides the same interface but doesn't try to connect to Firebase

// Mock types
interface MockFirestore {
  collection: (name: string) => {
    doc: (id: string) => {
      get: () => Promise<{ exists: boolean; data: () => Record<string, unknown> }>;
      set: (data: Record<string, unknown>, options?: Record<string, unknown>) => Promise<void>;
      update: (data: Record<string, unknown>) => Promise<void>;
    };
    add: (data: Record<string, unknown>) => Promise<{ id: string }>;
    where: (field: string, operator: string, value: unknown) => {
      get: () => Promise<{ docs: unknown[] }>;
    };
  };
}

interface MockBucket {
  file: (path: string) => {
    save: (data: Buffer, options?: Record<string, unknown>) => Promise<void>;
    getSignedUrl: (options: Record<string, unknown>) => Promise<string[]>;
    delete: () => Promise<void>;
  };
  upload: (path: string, options?: Record<string, unknown>) => Promise<void>;
}

// Mock implementation
const mockAdminDb: MockFirestore = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => {},
      update: async () => {},
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({ get: async () => ({ docs: [] }) }),
  }),
};

const mockAdminStorage: MockBucket = {
  file: () => ({
    save: async () => {},
    getSignedUrl: async () => ['https://example.com/mock-url'],
    delete: async () => {},
  }),
  upload: async () => {},
};

// Export mock implementations
const adminDb = mockAdminDb;
const adminStorage = mockAdminStorage;
const isInitialized = false;

// Mock admin object
const admin = {
  credential: {
    cert: () => ({}),
  },
  initializeApp: () => ({}),
  firestore: () => mockAdminDb,
  storage: () => ({ bucket: () => mockAdminStorage }),
};

console.log('Using mock Firebase Admin SDK');

export { admin, adminDb, adminStorage, isInitialized }; 