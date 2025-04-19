import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import sessionStorage from '../../lib/sessionStorage';

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

// Create OpenAI client with fallback handling
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: NextRequest): Promise<NextResponse<PdfResponse | ErrorResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;
    
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

    // Generate embedding if OpenAI API key is available
    let embedding: number[] = [];
    if (openai) {
      try {
        const embeddingRes = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        embedding = embeddingRes.data[0].embedding;
      } catch (error) {
        console.error('Error generating embedding:', error);
        // Continue without embedding
      }
    }

    // Create a session ID
    const sessionId = Date.now().toString();
    
    // Store PDF data in memory
    sessionStorage.set(sessionId, {
      text,
      embedding,
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
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 