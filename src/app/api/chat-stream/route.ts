import { NextRequest, NextResponse } from "next/server";
import { Readable } from 'stream';
import { exec, ChildProcess } from 'child_process';
import sessionStorage, { PdfSession } from '@/app/lib/sessionStorage';
import process from 'process';

export const dynamic = 'force-dynamic';

interface ChatStreamRequest {
  message: string;
  manualId?: string;
  pdfSessionId?: string;
  lang?: 'en' | 'de' | 'fr';
}

// This function turns a regular stream into a ReadableStream for Web API
function nodeStreamToWeb(nodeStream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      nodeStream.on('end', () => {
        controller.close();
      });
      nodeStream.on('error', (error) => {
        controller.error(error);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function POST(request: NextRequest) {
  const { message, manualId, pdfSessionId, lang = 'en' } = await request.json() as ChatStreamRequest;

  // Validate language parameter
  const validLang = ['en', 'de', 'fr'].includes(lang || 'en') ? lang : 'en';

  if (!message) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  try {
    // Create a Node.js readable stream that we control
    const stream = new Readable({
      read() {} // Implementation required but we don't need to do anything here
    });

    // Check if we're in a PDF chat session
    let pdfContext = '';
    let pdfFileName = '';
    if (pdfSessionId && sessionStorage.has(pdfSessionId)) {
      const pdfData = sessionStorage.get(pdfSessionId) as PdfSession;
      pdfContext = pdfData.text || '';
      pdfFileName = pdfData.fileName || 'document.pdf';
      console.log(`Using PDF session for ${pdfFileName}`);
    }

    // Process function to generate chunks of text over time
    const processStream = async () => {
      try {
        // Escape the question to prevent command injection
        const escapedQuestion = message.replace(/["\\]/g, '\\$&');
        
        // Check if we're in a production environment like Vercel
        if (process.env.VERCEL) {
          console.log('Running in Vercel environment, using fallback response');
          // Provide a fallback experience for Vercel
          stream.push('I cannot process this request in streaming mode in this environment. ');
          stream.push('Please try again using the standard chat interface.');
          stream.push(null); // End the stream
          return;
        }
        
        let pythonCommand = `python scripts/deepseek_stream.py "${escapedQuestion}" "${validLang}" ${manualId || ''}`;
        
        // Add PDF context if available
        if (pdfContext) {
          // Start with PDF info indicator in the response
          if (validLang === 'de') {
            stream.push(`Unter Verwendung von Informationen aus "${pdfFileName}":\n\n`);
          } else if (validLang === 'fr') {
            stream.push(`En utilisant les informations de "${pdfFileName}":\n\n`);
          } else {
            stream.push(`Using information from "${pdfFileName}":\n\n`);
          }
          
          // Pass PDF context to the Python script (first 2000 chars to avoid command line issues)
          const contextPreview = pdfContext.substring(0, 2000).replace(/["\\]/g, '\\$&');
          pythonCommand += ` --context="${contextPreview}"`;
        }
        
        // Use our local DeepSeek stream script with language parameter
        const pythonProcess: ChildProcess = exec(pythonCommand);
        
        // Pipe the output directly to our stream
        if (pythonProcess.stdout) {
          pythonProcess.stdout.on('data', (data) => {
            stream.push(data);
          });
        }
        
        if (pythonProcess.stderr) {
          pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
          });
        }
        
        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
          stream.push(null); // End the stream
        });
        
      } catch (error) {
        console.error('Error in stream processing:', error);
        
        // Language-specific error messages
        let errorMsg = 'Error generating response.';
        if (validLang === 'de') {
          errorMsg = 'Fehler bei der Generierung der Antwort.';
        } else if (validLang === 'fr') {
          errorMsg = 'Erreur lors de la génération de la réponse.';
        }
        
        stream.push(errorMsg);
        stream.push(null);
      }
    };

    // Start processing in the background
    processStream();

    // Convert our Node.js stream to a Web API stream
    const webStream = nodeStreamToWeb(stream);
    
    // Return the stream as the response
    return new Response(webStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Language': validLang
      }
    });
  } catch (error) {
    console.error("Error in chat streaming API:", error);
    
    // Language-specific error messages
    let errorMsg = "Failed to generate streaming response";
    if (lang === 'de') {
      errorMsg = "Fehler bei der Generierung der Streaming-Antwort";
    } else if (lang === 'fr') {
      errorMsg = "Échec de la génération de la réponse en streaming";
    }
    
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
} 