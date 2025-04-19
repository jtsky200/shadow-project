import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// In-memory storage for uploaded PDF sessions
// This would be replaced with a database in production
const pdfSessions = new Map();

export async function POST(request: Request) {
  try {
    const { question, sessionId } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Check if we have a valid session ID for a PDF
    let pdfContext = "";
    
    if (sessionId && pdfSessions.has(sessionId)) {
      const pdfData = pdfSessions.get(sessionId);
      
      // Here you would extract text from the PDF file
      // For now, we'll use a simulated context
      pdfContext = `Using information from "${pdfData.fileName}" to answer your question.`;
    }
    
    // For demo purposes, we'll use a Python script to simulate responses
    try {
      // Escape the question to prevent command injection
      const escapedQuestion = question.replace(/["\\]/g, '\\$&');
      
      // Call our DeepSeek stream script with the question
      const { stdout } = await execPromise(`python scripts/deepseek_stream.py "${escapedQuestion}"`);
      
      return NextResponse.json({
        response: pdfContext 
          ? `${pdfContext}\n\n${stdout.trim()}`
          : stdout.trim(),
        source: "pdf-chat"
      });
    } catch (error: unknown) {
      console.error("Error executing AI script:", error);
      return NextResponse.json({
        response: "I'm having trouble accessing the PDF information right now. Please try again.",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
  } catch (error) {
    console.error('Error in PDF chat:', error);
    return NextResponse.json(
      { error: 'Failed to process your question' },
      { status: 500 }
    );
  }
} 