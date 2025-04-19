import { NextRequest, NextResponse } from 'next/server';

// Define interface for the message
interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date | string;
}

// Define interface for the request body
interface SaveChatRequest {
  sessionId: string;
  messages: ChatMessage[];
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages } = await req.json() as SaveChatRequest;

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request. SessionId and messages array are required.' },
        { status: 400 }
      );
    }

    // Log the request but don't actually save to Firestore
    console.log(`Mock saving chat for session ${sessionId} with ${messages.length} messages`);

    // Always return success
    return NextResponse.json({ 
      success: true,
      mock: true,
      message: 'Chat saved to memory only (Firebase disabled)'
    });
  } catch (error) {
    console.error('Error in save chat handler:', error);
    
    return NextResponse.json({ 
      success: true,
      mock: true,
      message: 'Error handled, but save succeeded in mock mode'
    });
  }
} 