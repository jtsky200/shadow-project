// This is a mock implementation of Firebase services
// It provides the same interface but doesn't actually connect to Firebase

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

// Mock data
const mockManuals: Manual[] = [
  {
    id: "manual-1",
    title: "2024 Cadillac Escalade Owner's Manual",
    description: "Complete owner's manual for the 2024 Cadillac Escalade",
    fileSize: "12.4MB",
    pages: 423,
    year: "2024",
    model: "Escalade",
    path: "/assets/manuals/escalade-2024",
    downloadPath: "/assets/downloads/escalade-2024.pdf",
    documentType: "manual",
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2023-12-15"),
  },
  {
    id: "manual-2",
    title: "2024 Cadillac Lyriq User Guide",
    description: "Complete guide for the 2024 Cadillac Lyriq EV",
    fileSize: "14.2MB",
    pages: 368,
    year: "2024",
    model: "Lyriq",
    path: "/assets/manuals/lyriq-2024",
    downloadPath: "/assets/downloads/lyriq-2024.pdf",
    documentType: "manual",
    createdAt: new Date("2023-12-10"),
    updatedAt: new Date("2023-12-10"),
  }
];

const mockCategories: TroubleshootingCategory[] = [
  { id: "cat-1", title: "Battery & Charging", icon: "battery-charging", order: 1 },
  { id: "cat-2", title: "Climate Control", icon: "thermometer", order: 2 },
  { id: "cat-3", title: "Infotainment System", icon: "monitor", order: 3 }
];

const mockIssues: Record<string, TroubleshootingIssue[]> = {
  "cat-1": [
    {
      id: "issue-1",
      title: "Battery not charging",
      description: "Vehicle battery will not charge when plugged in",
      solutions: [
        "Check if the charging cable is properly connected",
        "Ensure the charging station is powered on",
        "Check for any error messages on the dashboard"
      ],
      categoryId: "cat-1"
    }
  ],
  "cat-2": [
    {
      id: "issue-2",
      title: "AC not cooling",
      description: "Air conditioning is not producing cold air",
      solutions: [
        "Check if the AC is turned on",
        "Set the temperature to a lower setting",
        "Make sure the vents are not blocked"
      ],
      categoryId: "cat-2"
    }
  ]
};

// ===== Manuals Service =====
export const manualsService = {
  // Get all manuals
  async getAllManuals(): Promise<Manual[]> {
    return [...mockManuals];
  },
  
  // Get manual by ID
  async getManualById(id: string): Promise<Manual | null> {
    const manual = mockManuals.find(m => m.id === id);
    return manual ? {...manual} : null;
  },
  
  // Get manuals by model
  async getManualsByModel(model: string): Promise<Manual[]> {
    return mockManuals.filter(m => m.model === model).map(m => ({...m}));
  }
};

// ===== Troubleshooting Service =====
export const troubleshootingService = {
  // Get all categories
  async getAllCategories(): Promise<TroubleshootingCategory[]> {
    return [...mockCategories];
  },
  
  // Get issues by category
  async getIssuesByCategory(categoryId: string): Promise<TroubleshootingIssue[]> {
    return mockIssues[categoryId] ? [...mockIssues[categoryId]] : [];
  }
};

// ===== User Settings Service =====
export const userSettingsService = {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return {
      userId,
      theme: 'system',
      fontSize: 16,
      defaultModel: 'gpt-4',
      notifications: true
    };
  },
  
  // Save user settings
  async saveUserSettings(settings: UserSettings): Promise<boolean> {
    console.log("Mock saving user settings:", settings);
    return true;
  }
};

// ===== Documents Service =====
export const documentsService = {
  // Get all documents
  async getAllDocuments(): Promise<UserDocument[]> {
    return [];
  },
  
  // Get user documents
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    return [];
  },
  
  // Add document
  async addDocument(document: Omit<UserDocument, 'id'>): Promise<string | null> {
    console.log("Mock adding document:", document);
    return "mock-document-id";
  },
  
  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    console.log("Mock deleting document:", id);
    return true;
  },
  
  // Get user library items
  async getUserLibraryItems(userId: string): Promise<LibraryItem[]> {
    return [];
  },
  
  // Add library item
  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<string | null> {
    console.log("Mock adding library item:", item);
    return "mock-library-item-id";
  },
  
  // Toggle favorite
  async toggleFavorite(userId: string, itemId: string, isFavorite: boolean): Promise<boolean> {
    console.log(`Mock toggling favorite for item ${itemId} to ${isFavorite}`);
    return true;
  },
  
  // Delete library item
  async deleteLibraryItem(userId: string, itemId: string): Promise<boolean> {
    console.log(`Mock deleting library item ${itemId} for user ${userId}`);
    return true;
  },
  
  // Upload file
  async uploadFile(file: File, path: string): Promise<string> {
    console.log(`Mock uploading file ${file.name} to ${path}`);
    return "https://example.com/mock-upload-url";
  },
  
  // Upload file via API
  async uploadFileViaApi(file: File): Promise<{ url: string; path: string; }> {
    console.log(`Mock uploading file ${file.name} via API`);
    return {
      url: "https://example.com/mock-upload-url",
      path: `/uploads/mock-${file.name}`
    };
  },
  
  // Delete file
  async deleteFile(path: string): Promise<boolean> {
    console.log(`Mock deleting file at ${path}`);
    return true;
  },
  
  // Save chat messages
  async saveChatMessages(sessionId: string, messages: ChatMessage[]): Promise<boolean> {
    console.log(`Mock saving chat messages for session ${sessionId}`);
    return true;
  },
  
  // Get chat history
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return [];
  }
};

// Export a default service object that combines all services
const services = {
  manuals: manualsService,
  troubleshooting: troubleshootingService,
  userSettings: userSettingsService,
  documents: documentsService,
  library: documentsService,
  files: documentsService,
  chat: documentsService
};

export { services }; 