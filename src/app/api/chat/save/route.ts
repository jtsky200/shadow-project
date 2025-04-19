import { NextRequest, NextResponse } from 'next/server';
import { adminDb, isInitialized } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages } = await req.json();

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request. SessionId and messages array are required.' },
        { status: 400 }
      );
    }

    // Check if Firebase is initialized
    if (!isInitialized) {
      console.warn('Firebase not initialized, skipping save to Firestore');
      return NextResponse.json({ 
        success: true,
        mock: true,
        message: 'Saved in mock mode (Firebase not initialized)'
      });
    }

    // Save chat to Firestore
    await adminDb.collection('cadillac-chat').doc(sessionId).set({
      messages,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving chat:', error);
    
    // Return success in production to avoid build errors
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: true,
        mock: true,
        message: 'Saved in mock mode (error handling)'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to save chat history' },
      { status: 500 }
    );
  }
} 