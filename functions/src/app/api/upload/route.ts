import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file metadata
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    // Upload file to Firebase Storage
    const fileRef = adminStorage.file(filePath);
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name
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
      name: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 