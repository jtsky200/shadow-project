import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminStorage, isInitialized } from '@/lib/firebase-admin';

interface FileMetadata {
  name: string;
  type: string;
  size: number;
}

type SignedUrlOptions = {
  version: 'v4';
  action: 'read';
  expires: Date;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const metadata: FileMetadata = {
      name: file.name,
      type: file.type,
      size: file.size,
    };
    
    // Check if Firebase is properly initialized
    if (!isInitialized) {
      console.warn('Firebase not initialized, returning mock URL');
      return NextResponse.json({
        success: true,
        url: 'https://example.com/mock-signed-url',
        metadata,
      });
    }
    
    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = `uploads/${uniqueFileName}`;
    
    // Get the file contents as Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Firebase Storage
    const fileRef = adminStorage.file(filePath);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });
    
    // Generate a signed URL for accessing the file
    const [signedUrl] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    } as SignedUrlOptions);
    
    console.log(`File uploaded: ${filePath}`);
    return NextResponse.json({
      success: true,
      url: signedUrl,
      metadata,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: (error as Error).message },
      { status: 500 }
    );
  }
} 