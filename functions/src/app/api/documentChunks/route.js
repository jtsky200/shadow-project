import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Utility function to read embedded manual data
function readManualData() {
  try {
    // Try to read the processed embeddings file first
    const embeddings = path.join(process.cwd(), 'manual-embeddings.json');
    if (fs.existsSync(embeddings)) {
      return JSON.parse(fs.readFileSync(embeddings, 'utf-8'));
    }
    
    // Fall back to raw content
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
    
    // If neither exists, check for manuals in public directory
    const publicManuals = path.join(process.cwd(), 'public', 'assets', 'manuals');
    if (fs.existsSync(publicManuals)) {
      const manualIndex = path.join(publicManuals, 'index.json');
      if (fs.existsSync(manualIndex)) {
        return { source: 'index', data: JSON.parse(fs.readFileSync(manualIndex, 'utf-8')) };
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error reading manual data:', error);
    return [];
  }
}

export async function GET() {
  try {
    const data = readManualData();
    
    // Return simplified chunks with metadata
    if (Array.isArray(data)) {
      // Remove embeddings if present to reduce response size
      const chunks = data.map(chunk => ({
        page: chunk.page,
        title: chunk.title,
        preview: chunk.text.substring(0, 200) + '...',
        textLength: chunk.text.length,
      }));
      
      return NextResponse.json({
        success: true,
        source: 'manualChunks',
        count: chunks.length,
        chunks
      });
    } else if (data.source === 'index') {
      // Return manual index data
      return NextResponse.json({
        success: true,
        source: 'manualIndex',
        manuals: data.data
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'No document chunks available'
    }, { status: 404 });
  } catch (error) {
    console.error('Error in document chunks API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve document chunks'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { page, title } = await req.json();
    
    if (!page && !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing page number or title parameter'
      }, { status: 400 });
    }
    
    const data = readManualData();
    
    if (!Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Manual data not available in expected format'
      }, { status: 404 });
    }
    
    // Find the specific chunk by page number or title
    const chunk = data.find(c => 
      (page && c.page === parseInt(page)) || 
      (title && c.title === title)
    );
    
    if (!chunk) {
      return NextResponse.json({
        success: false,
        error: 'Document chunk not found'
      }, { status: 404 });
    }
    
    // Return the full chunk text
    return NextResponse.json({
      success: true,
      chunk: {
        page: chunk.page,
        title: chunk.title,
        text: chunk.text
      }
    });
  } catch (error) {
    console.error('Error in document chunks API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve document chunk'
    }, { status: 500 });
  }
} 