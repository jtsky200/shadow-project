import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import sessionStorage from '../../lib/sessionStorage.js';

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf');
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF uploaded' }, { status: 400 });
    }

    // Create a temporary file path
    const tempFilePath = join(tmpdir(), `${uuidv4()}.pdf`);
    
    // Convert the file to a buffer and save it temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write the file to disk
    await writeFile(tempFilePath, buffer);
    
    // Parse the PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text.slice(0, 8000); // Limit text size

    // Generate embedding
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    // Create a session ID
    const sessionId = Date.now().toString();
    
    // Store PDF data in memory
    sessionStorage.set(sessionId, {
      text,
      embedding: embeddingRes.data[0].embedding,
      fileName: file.name,
      uploadDate: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      sessionId,
      fileName: file.name,
      contentPreview: text.slice(0, 300) + '...' 
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 