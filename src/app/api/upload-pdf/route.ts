import { NextRequest, NextResponse } from 'next/server';

// Define response types
interface PdfResponse {
  success: boolean;
  sessionId: string;
  fileName: string;
  contentPreview: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<PdfResponse | ErrorResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF uploaded' }, { status: 400 });
    }

    // Create a session ID
    const sessionId = Date.now().toString();
    
    return NextResponse.json({ 
      success: true, 
      sessionId,
      fileName: file.name,
      contentPreview: 'PDF content preview not available in this version.' 
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 