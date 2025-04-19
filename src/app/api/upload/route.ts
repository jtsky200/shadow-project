import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface FileMetadata {
  name: string;
  type: string;
  size: number;
}

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
    
    // Generate a unique file name for the mock URL
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    
    console.log(`Mock file upload: ${file.name} (${file.size} bytes)`);
    
    // Return a mock response
    return NextResponse.json({
      success: true,
      url: `https://example.com/mock-uploads/${uniqueFileName}`,
      path: `uploads/${uniqueFileName}`,
      metadata,
      mock: true
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 