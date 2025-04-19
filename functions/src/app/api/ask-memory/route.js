import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, sessionId } = body;
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    // In development, proxy to the local server
    // In production, this could connect directly to the main API
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.DEEPSEEK_API_URL || 'http://localhost:3001/ask-memory'
      : 'http://localhost:3001/ask-memory';
      
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question,
        sessionId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Memory API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 