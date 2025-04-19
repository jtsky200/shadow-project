import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { firestore } from '@/lib/firebase';

export async function GET() {
  try {
    // Test both client and admin SDK
    const clientStatus = firestore ? 'Connected' : 'Failed';
    
    let adminStatus = 'Failed';
    try {
      // Try to access a collection to verify connection
      const testRef = adminDb.collection('test');
      await testRef.doc('test').set({ timestamp: new Date().toISOString() });
      adminStatus = 'Connected';
    } catch (error) {
      console.error('Admin SDK test failed:', error);
    }
    
    return NextResponse.json({
      status: 'success',
      clientSDK: clientStatus,
      adminSDK: adminStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Firebase test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to connect to Firebase',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 