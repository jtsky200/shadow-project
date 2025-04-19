import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { question } = body;
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    // In development, proxy to the local server
    // In production, this could connect directly to DeepSeek API
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.DEEPSEEK_API_URL || 'http://localhost:3001/ask-stream'
      : 'http://localhost:3001/ask-stream';
      
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    
    // Create a TransformStream to forward the streamed response
    const { readable, writable } = new TransformStream();
    
    response.body.pipeTo(writable);
    
    return new Response(readable);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 