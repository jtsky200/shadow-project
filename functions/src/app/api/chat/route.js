import { NextResponse } from "next/server";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import pdfSessions from '@/app/lib/pdfSessions';

const execPromise = promisify(exec);

export async function POST(request) {
  try {
    const { question, manualId, model, year, pdfSessionId } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Check if DeepSeek API key exists
    if (!process.env.DEEPSEEK_API_KEY) {
      console.log("No DeepSeek API key found, using local mock script");
      
      try {
        // Check if we're in a PDF chat session
        if (pdfSessionId && pdfSessions.has(pdfSessionId)) {
          const pdfData = pdfSessions.get(pdfSessionId);
          console.log(`Using PDF session for ${pdfData.fileName}`);
        }
        
        // Escape the question to prevent command injection
        const escapedQuestion = question.replace(/["\\]/g, '\\$&');
        
        // Use our local DeepSeek stream script
        const { stdout } = await execPromise(`python scripts/deepseek_stream.py "${escapedQuestion}"`);
        
        let response = stdout.trim();
        
        // If PDF session exists, prepend context info
        if (pdfSessionId && pdfSessions.has(pdfSessionId)) {
          const pdfData = pdfSessions.get(pdfSessionId);
          response = `Using information from "${pdfData.fileName}":\n\n${response}`;
        }
        
        return NextResponse.json({
          response,
          source: "local-script"
        });
      } catch (error) {
        console.error("Error executing local script:", error);
        return NextResponse.json({
          response: "I'm having trouble accessing the information right now. Please try again.",
          error: error.message
        });
      }
    }
    
    // If we have an API key, continue with the normal API flow
    let context = "";

    // Check for PDF session first
    if (pdfSessionId && pdfSessions.has(pdfSessionId)) {
      const pdfData = pdfSessions.get(pdfSessionId);
      context = `PDF: ${pdfData.fileName}\n${pdfData.text || ""}`;
    }
    // Otherwise get relevant context for the manual if manualId is provided
    else if (manualId) {
      try {
        // Get the project root directory
        const publicDir = path.join(process.cwd(), 'public');
        const contentPath = path.join(publicDir, 'assets', 'manuals', manualId, 'content.json');
        
        try {
          // Read the file synchronously
          const fileContent = await fs.readFile(contentPath, 'utf8');
          const manualData = JSON.parse(fileContent);
          
          // Extract text from the first 5 pages as context
          if (Array.isArray(manualData)) {
            context = manualData.slice(0, 5).map(page => page.rawText).join("\n\n");
          }
        } catch (fileError) {
          console.error("Error reading manual file:", fileError);
        }
      } catch (error) {
        console.error("Error fetching manual data:", error);
      }
    }

    // Prepare system message with context and vehicle info
    let systemPrompt;
    
    if (pdfSessionId && pdfSessions.has(pdfSessionId)) {
      const pdfData = pdfSessions.get(pdfSessionId);
      systemPrompt = `You are a helpful PDF assistant analyzing "${pdfData.fileName}". 
Answer the user's question based on the PDF content.
${context ? `\nHere is some information from the PDF:\n${context}` : ""}`;
    } else {
      systemPrompt = `You are a helpful automotive assistant for ${year || "2024"} ${model || "Cadillac"}. 
Answer the user's question based on your knowledge of the vehicle.
${context ? `\nHere is some information from the vehicle manual:\n${context}` : ""}`;
    }

    console.log("Calling DeepSeek API with API key:", process.env.DEEPSEEK_API_KEY?.substring(0, 5) + "...");

    // Call DeepSeek API
    const deepseekResponse = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    // Extract assistant's response
    const assistantResponse = deepseekResponse.data.choices[0].message.content;

    // Return response
    return NextResponse.json({
      response: assistantResponse,
      source: "deepseek-api"
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { 
        response: "I apologize, but I'm having trouble accessing the information right now. Please try again later.",
        error: error.message 
      },
      { status: 500 }
    );
  }
} 