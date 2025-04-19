import pdfSessions from '@/app/lib/pdfSessions';
import { analyzeDocument, storeDocumentAnalysis, DOCUMENT_TYPES } from '@/app/lib/documentAnalyzer';

import { NextResponse } from 'next/server';

import { writeFile, mkdir } from 'fs/promises';

import { join } from 'path';

import { existsSync } from 'fs';

// Define interface for document analysis result
interface DocumentAnalysisResult {
  type: string;
  category: string;
  data: {
    title: string;
    description: string;
    fileSize: number;
    path: string;
    fileName: string;
    // Use a more specific index signature for additional properties
    [key: string]: string | number | boolean | null | undefined;
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique session ID
    const sessionId = Date.now().toString();
    const fileName = `${sessionId}-${file.name.replace(/\s+/g, '_')}`;
    
    // Ensure the temporary directory exists
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Write the file to disk
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Store the file information in the shared PDF sessions store
    pdfSessions.store(sessionId, {
      fileName: file.name,
      filePath,
      uploadTime: new Date(),
      // In a real implementation, we would extract text content:
      // text: "Extracted PDF text would go here"
    });

    // Analyze the document to determine its type and extract data
    const analysisResult = await analyzeDocument(filePath, file.name) as DocumentAnalysisResult;
    
    // Store the analysis results in appropriate data stores
    await storeDocumentAnalysis(analysisResult);

    // Prepare response with additional document info
    const responseData = {
      success: true,
      sessionId,
      fileName: file.name,
      documentType: analysisResult.type,
      documentCategory: analysisResult.category,
      // If it's a specification, include the redirect URL
      redirectUrl: analysisResult.type === DOCUMENT_TYPES.SPECIFICATION 
        ? '/specifications' 
        : null
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF upload' },
      { status: 500 }
    );
  }
} 