import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Fallback to client-side API if backend server is not available
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, sessionId } = body;
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    // In development, proxy to the local server
    // In production, connect to the production API
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.DEEPSEEK_API_URL || 'http://localhost:3001/ask-memory'
      : 'http://localhost:3001/ask-memory';
    
    try {  
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          sessionId
        }),
        // Add a reasonable timeout
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });
      
      if (!response.ok) {
        throw new Error(`Memory API error: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (serverError) {
      console.error('Backend server error, using OpenAI fallback:', serverError);
      
      // Fallback to OpenAI API directly
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful Cadillac vehicle assistant providing information about Cadillac vehicles, features, and troubleshooting.' },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
      });
      
      const answer = completion.choices[0].message.content;
      
      return NextResponse.json({ 
        answer,
        sessionId,
        source: 'fallback-api'
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 