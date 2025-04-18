# Firebase Storage Setup Guide

This guide will walk you through setting up Firebase Storage for your Shadow AI application.

## Prerequisites

1. A Firebase project with Firestore database
2. Firebase admin SDK credentials

## Step 1: Configure Firebase in your application

Make sure your `.env` file contains the appropriate Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 2: Initialize Firebase Storage

In your Firebase configuration file (e.g., `src/lib/firebase.ts`), initialize Firebase Storage:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, firestore, storage };
```

## Step 3: Set up Firebase Storage Rules

In your Firebase console, navigate to Storage > Rules and configure security rules:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 4: Using Firebase Storage in your application

Here's an example of uploading a file to Firebase Storage:

```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
```

And retrieving files:

```typescript
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

async function getFilesFromStorage(path) {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  
  const files = await Promise.all(
    result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        url,
      };
    })
  );
  
  return files;
}
```

## Step 5: Update your Firebase security settings

Ensure that your Firebase Storage security rules are properly configured to restrict access according to your application's requirements.

For more information, see the [Firebase Storage Security Rules documentation](https://firebase.google.com/docs/storage/security). 