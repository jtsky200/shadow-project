// Type definitions for mock implementations
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

// Add a Firebase Storage bucket type definition
interface StorageBucket {
  file: (path: string) => {
    save: (data: Buffer, options?: Record<string, unknown>) => Promise<void>;
    getSignedUrl: (options: Record<string, unknown>) => Promise<string[]>;
    delete: () => Promise<void>;
  };
  upload: (path: string, options?: Record<string, unknown>) => Promise<void>;
}

// Extend the module declaration to include our custom types
declare module "@/lib/firebase-admin" {
  import { Firestore } from "firebase-admin/firestore";

  export const adminDb: Firestore | MockFirestore;
  export const adminStorage: StorageBucket | MockBucket;
  export const isInitialized: boolean;
  export const admin: typeof import("firebase-admin");
} 