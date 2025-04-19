import { NextResponse } from "next/server";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import sessionStorage from '../../lib/sessionStorage.js';

const execPromise = promisify(exec);

// Language-specific system prompts
const systemPrompts = {
  en: {
    pdf: 'You are a helpful PDF assistant analyzing "{fileName}". Answer the user\'s question based on the PDF content.',
    vehicle: 'You are a helpful automotive assistant for {year} {model}. Answer the user\'s question based on your knowledge of the vehicle.'
  },
  de: {
    pdf: 'Du bist ein hilfreicher PDF-Assistent, der "{fileName}" analysiert. Beantworte die Frage des Benutzers basierend auf dem PDF-Inhalt.',
    vehicle: 'Du bist ein hilfreicher Fahrzeug-Assistent für {year} {model}. Beantworte die Frage des Benutzers basierend auf deinem Wissen über das Fahrzeug.'
  },
  fr: {
    pdf: 'Vous êtes un assistant PDF utile qui analyse "{fileName}". Répondez à la question de l\'utilisateur en fonction du contenu du PDF.',
    vehicle: 'Vous êtes un assistant automobile utile pour {year} {model}. Répondez à la question de l\'utilisateur en fonction de vos connaissances sur le véhicule.'
  }
};

export async function POST(request) {
  try {
    const { question, manualId, model, year, pdfSessionId, lang = 'en' } = await request.json();

    // Validate language parameter (fallback to English if invalid)
    const validLang = ['en', 'de', 'fr'].includes(lang) ? lang : 'en';

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
        if (pdfSessionId && sessionStorage.has(pdfSessionId)) {
          const pdfData = sessionStorage.get(pdfSessionId);
          console.log(`Using PDF session for ${pdfData.fileName}`);
        }
        
        // Escape the question to prevent command injection
        const escapedQuestion = question.replace(/["\\]/g, '\\$&');
        
        // Use our local DeepSeek stream script - pass language parameter
        const { stdout } = await execPromise(`python scripts/deepseek_stream.py "${escapedQuestion}" "${validLang}"`);
        
        let response = stdout.trim();
        
        // If PDF session exists, prepend context info
        if (pdfSessionId && sessionStorage.has(pdfSessionId)) {
          const pdfData = sessionStorage.get(pdfSessionId);
          
          // Use language-specific message
          if (validLang === 'de') {
            response = `Unter Verwendung von Informationen aus "${pdfData.fileName}":\n\n${response}`;
          } else if (validLang === 'fr') {
            response = `En utilisant les informations de "${pdfData.fileName}":\n\n${response}`;
          } else {
            response = `Using information from "${pdfData.fileName}":\n\n${response}`;
          }
        }
        
        return NextResponse.json({
          response,
          source: "local-script",
          lang: validLang
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
    if (pdfSessionId && sessionStorage.has(pdfSessionId)) {
      const pdfData = sessionStorage.get(pdfSessionId);
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
    
    if (pdfSessionId && sessionStorage.has(pdfSessionId)) {
      const pdfData = sessionStorage.get(pdfSessionId);
      const promptTemplate = systemPrompts[validLang].pdf.replace('{fileName}', pdfData.fileName);
      systemPrompt = `${promptTemplate}
${context ? `\n${validLang === 'de' ? 'Hier sind einige Informationen aus dem PDF:' : validLang === 'fr' ? 'Voici quelques informations du PDF:' : 'Here is some information from the PDF:'}\n${context}` : ""}`;
    } else {
      const promptTemplate = systemPrompts[validLang].vehicle
        .replace('{year}', year || "2024")
        .replace('{model}', model || "Cadillac");
      
      systemPrompt = `${promptTemplate}
${context ? `\n${validLang === 'de' ? 'Hier sind einige Informationen aus dem Fahrzeughandbuch:' : validLang === 'fr' ? 'Voici quelques informations du manuel du véhicule:' : 'Here is some information from the vehicle manual:'}\n${context}` : ""}`;
    }

    console.log(`Calling DeepSeek API with API key: ${process.env.DEEPSEEK_API_KEY?.substring(0, 5)}... (Language: ${validLang})`);

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
      source: "deepseek-api",
      lang: validLang
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