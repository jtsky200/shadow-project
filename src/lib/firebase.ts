// This is a temporary mock implementation of the Firebase client SDK
// It provides the same interface but doesn't try to connect to Firebase

// Mock firestore implementation
const firestore = {
  collection: (_name: string) => ({
    doc: (_id: string) => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => {},
      update: async () => {},
    }),
    add: async (_data: Record<string, unknown>) => ({ id: 'mock-id' }),
    where: () => ({
      orderBy: () => ({
        get: async () => ({ docs: [] }),
      }),
      get: async () => ({ docs: [] }),
    }),
    orderBy: () => ({
      get: async () => ({ docs: [] }),
    }),
  }),
};

// Mock storage implementation
const storage = {
  ref: (_path: string) => ({
    put: async () => ({
      ref: {
        getDownloadURL: async () => 'https://example.com/mock-file-url',
      },
    }),
    delete: async () => {},
    getDownloadURL: async () => 'https://example.com/mock-file-url',
    listAll: async () => ({ items: [] }),
  }),
};

console.log('Using mock Firebase client SDK');

export { firestore, storage }; 