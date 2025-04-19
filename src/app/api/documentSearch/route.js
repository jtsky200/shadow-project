import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Simple cosine similarity calculation for fallback search
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !vecA.length || !vecB.length) return 0;
  
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// Read the manual embeddings or fallback to content
function readManualData() {
  try {
    const embeddings = path.join(process.cwd(), 'manual-embeddings.json');
    if (fs.existsSync(embeddings)) {
      return JSON.parse(fs.readFileSync(embeddings, 'utf-8'));
    }
    
    const content = path.join(process.cwd(), 'manual-content.json');
    if (fs.existsSync(content)) {
      return JSON.parse(fs.readFileSync(content, 'utf-8'))
        .map(entry => ({
          page: entry.pageNumber,
          title: entry.title || '',
          text: (entry.ocrText || '') + (entry.rawText ? `\n${entry.rawText}` : ''),
        }))
        .filter(chunk => chunk.text.trim().length > 0);
    }
    
    return [];
  } catch (error) {
    console.error('Error reading manual data:', error);
    return [];
  }
}

// Basic keyword search as fallback
function keywordSearch(chunks, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  return chunks
    .map(chunk => {
      const text = (chunk.text || '').toLowerCase();
      const title = (chunk.title || '').toLowerCase();
      
      // Calculate basic relevance score
      const titleMatches = terms.filter(term => title.includes(term)).length;
      const contentMatches = terms.reduce((count, term) => {
        const regex = new RegExp(term, 'gi');
        const matches = (text.match(regex) || []).length;
        return count + matches;
      }, 0);
      
      return {
        ...chunk,
        score: (titleMatches * 3) + contentMatches,
        preview: chunk.text?.substring(0, 200) + '...'
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export async function POST(req) {
  try {
    const { query, useAI = true, limit = 5 } = await req.json();
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }
    
    const chunks = readManualData();
    
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No document chunks available'
      }, { status: 404 });
    }
    
    // Check if we should use vector search
    const useVectorSearch = useAI && process.env.OPENAI_API_KEY && 
      chunks.some(chunk => chunk.embedding);
    
    if (useVectorSearch) {
      try {
        // Use OpenAI to create query embedding
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: query,
          dimensions: 1536
        });
        
        if (!embedding.data?.[0]?.embedding) {
          throw new Error('Failed to generate embedding');
        }
        
        const queryEmbedding = embedding.data[0].embedding;
        
        // Find most similar chunks using cosine similarity
        const results = chunks
          .filter(chunk => chunk.embedding)
          .map(chunk => ({
            page: chunk.page,
            title: chunk.title,
            preview: chunk.text.substring(0, 200) + '...',
            score: cosineSimilarity(queryEmbedding, chunk.embedding),
            text: chunk.text
          }))
          .filter(result => result.score > 0.6) // Only return relevant results
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        
        return NextResponse.json({
          success: true,
          searchType: 'vector',
          results
        });
      } catch (error) {
        console.error('Vector search failed:', error);
        // Fall back to keyword search
      }
    }
    
    // Fallback to keyword search
    const results = keywordSearch(chunks, query);
    
    return NextResponse.json({
      success: true,
      searchType: 'keyword',
      results
    });
  } catch (error) {
    console.error('Error in document search API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search documents'
    }, { status: 500 });
  }
} 