import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import sessionStorage, { PdfSession } from '../../lib/sessionStorage';

// Define types
interface RetrieveDocRequest {
  query: string;
  sessionId?: string;
  threshold?: number;
}

interface EmbeddedChunk {
  text: string;
  page?: number;
  embedding: number[];
  similarity?: number;
}

interface RetrieveDocResponse {
  context: string;
  source: 'uploaded-pdf' | 'manual-embeddings' | 'manual-content-fallback' | 'none';
  filename?: string;
  matches?: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// Configure OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cosine similarity helper function
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a || !b || a.length !== b.length) return 0;
  
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
};

export async function POST(request: NextRequest): Promise<NextResponse<RetrieveDocResponse | ErrorResponse>> {
  try {
    const { query, sessionId, threshold = 0.6 } = await request.json() as RetrieveDocRequest;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // First check if we should use a user-uploaded PDF
    if (sessionId && sessionStorage.has(sessionId)) {
      const pdfData = sessionStorage.get(sessionId) as PdfSession;
      if (pdfData.embedding && pdfData.embedding.length > 0) {
        const similarity = cosineSimilarity(queryEmbedding, pdfData.embedding);
        if (similarity > threshold) {
          return NextResponse.json({
            context: pdfData.text,
            source: 'uploaded-pdf',
            filename: pdfData.fileName,
          });
        }
      } else {
        // If we have PDF text but no embedding, just return it
        return NextResponse.json({
          context: pdfData.text,
          source: 'uploaded-pdf',
          filename: pdfData.fileName,
        });
      }
    }
    
    // Try to load pre-embedded manual content
    let embedded: EmbeddedChunk[] = [];
    try {
      const embedFilePath = path.join(process.cwd(), 'manual-embeddings.json');
      const fileData = await fs.readFile(embedFilePath, 'utf-8');
      embedded = JSON.parse(fileData);
    } catch (error) {
      console.error('Failed to load manual embeddings:', error);
      // If embeddings file doesn't exist, try to load manual-content.json
      try {
        interface ManualContent {
          ocrText?: string;
          rawText?: string;
        }
        
        const manualFilePath = path.join(process.cwd(), 'manual-content.json');
        const fileData = await fs.readFile(manualFilePath, 'utf-8');
        const manualContent = JSON.parse(fileData) as ManualContent[];
        
        if (manualContent.length > 0) {
          // Just return some content as fallback
          const chunks = manualContent
            .filter(page => page.ocrText || page.rawText)
            .slice(0, 3)
            .map(page => page.ocrText || page.rawText || '');
            
          return NextResponse.json({
            context: chunks.join('\n\n---\n\n'),
            source: 'manual-content-fallback',
          });
        }
      } catch (manualError) {
        console.error('Failed to load manual content as fallback:', manualError);
      }
      
      return NextResponse.json({
        context: 'No relevant documents found.',
        source: 'none',
      });
    }
    
    // Find most relevant chunks using cosine similarity
    const results = embedded
      .map(e => ({
        ...e,
        similarity: cosineSimilarity(queryEmbedding, e.embedding),
      }))
      .filter(e => e.similarity !== undefined && e.similarity > threshold)
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 3);
    
    if (results.length === 0) {
      return NextResponse.json({
        context: 'No relevant content found in the manual.',
        source: 'none',
      });
    }
    
    // Format the context
    const context = results
      .map(r => `Page ${r.page || 'N/A'}:\n${r.text}`)
      .join('\n\n---\n\n');
    
    return NextResponse.json({
      context,
      source: 'manual-embeddings',
      matches: results.length,
    });
    
  } catch (error) {
    console.error('Document retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve documents', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 