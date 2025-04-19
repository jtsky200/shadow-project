import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import sessionStorage, { PdfSession } from '@/app/lib/sessionStorage';

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
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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
    
    // Check if OpenAI API is available
    if (!openai) {
      return NextResponse.json({
        context: 'OpenAI API is not available. Please configure the OPENAI_API_KEY environment variable.',
        source: 'none'
      });
    }
    
    // Generate embedding for the query
    let queryEmbedding: number[] = [];
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });
      queryEmbedding = embeddingResponse.data[0].embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      return NextResponse.json({
        context: 'Failed to generate embeddings for your query. Using text-based search instead.',
        source: 'none'
      });
    }
    
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
      try {
        const embedFilePath = path.join(process.cwd(), 'manual-embeddings.json');
        const fileData = await fs.readFile(embedFilePath, 'utf-8');
        embedded = JSON.parse(fileData);
      } catch (fileError) {
        console.error('Failed to load manual embeddings:', fileError);
        throw fileError; // Re-throw to the outer catch
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
        throw new Error('No relevant chunks found'); // Throw to the fallback
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
    } catch (embeddingsError) {
      // Log the original error
      console.error('Error processing embeddings:', embeddingsError);
      
      // Fallback to manual-content.json
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
      
      // Final fallback if nothing else worked
      return NextResponse.json({
        context: 'No relevant documents found.',
        source: 'none',
      });
    }
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