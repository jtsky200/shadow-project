import { NextResponse } from "next/server";
import { Readable } from 'stream';
import { exec } from 'child_process';

export const dynamic = 'force-dynamic';

// This function turns a regular stream into a ReadableStream for Web API
function nodeStreamToWeb(nodeStream) {
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

export async function POST(request) {
  const { message } = await request.json();

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

    // Process function to generate chunks of text over time
    const processStream = async () => {
      try {
        // Escape the question to prevent command injection
        const escapedQuestion = message.replace(/["\\]/g, '\\$&');
        
        // Use our local DeepSeek stream script
        const pythonProcess = exec(`python scripts/deepseek_stream.py "${escapedQuestion}"`);
        
        // Pipe the output directly to our stream
        pythonProcess.stdout.on('data', (data) => {
          stream.push(data);
        });
        
        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python Error: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
          stream.push(null); // End the stream
        });
        
      } catch (error) {
        console.error('Error in stream processing:', error);
        stream.push('Error generating response.');
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
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error("Error in chat streaming API:", error);
    return NextResponse.json(
      { error: "Failed to generate streaming response" },
      { status: 500 }
    );
  }
} 