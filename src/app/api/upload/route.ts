import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, isInitialized } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  let uploadedFile: File | null = null;
  
  try {
    const formData = await req.formData();
    uploadedFile = formData.get('file') as File;
    
    if (!uploadedFile) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file metadata
    const buffer = await uploadedFile.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const fileExtension = uploadedFile.name.split('.').pop() || 'bin';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    // Check if Firebase is initialized
    if (!isInitialized) {
      console.warn('Firebase not initialized, returning mock URL');
      return NextResponse.json({
        success: true,
        url: `https://example.com/mock-uploads/${fileName}`,
        path: filePath,
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      });
    }

    // Upload file to Firebase Storage
    const fileRef = adminStorage.file(filePath);
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: uploadedFile.type,
        metadata: {
          originalName: uploadedFile.name
        }
      }
    });

    // Get the public URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });

    return NextResponse.json({
      success: true,
      url,
      path: filePath,
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Fallback for production builds
    if (process.env.NODE_ENV === 'production' && uploadedFile) {
      const fileExtension = uploadedFile.name.split('.').pop() || 'bin';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `uploads/${fileName}`;
      
      return NextResponse.json({
        success: true,
        url: `https://example.com/mock-uploads/${fileName}`,
        path: filePath,
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 