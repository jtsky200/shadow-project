import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { query, context } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }
    
    // Add context to the prompt if provided
    const prompt = context 
      ? `Context from the manual:\n${context}\n\nUser query: ${query}\n\nPlease answer the question based on the context provided.`
      : query;
    
    // Check for API key
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("DeepSeek API key not found in environment variables");
      return NextResponse.json(
        { error: "API configuration error", detail: "Missing API key" },
        { status: 500 }
      );
    }
    
    try {
      // Call DeepSeek API
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an automotive expert assistant. Your role is to provide accurate and helpful information about vehicles based on their manual content."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
          }
        }
      );
      
      // Extract response
      return NextResponse.json({
        response: response.data.choices[0].message.content
      });
    } catch (apiError) {
      console.error("DeepSeek API error:", apiError.message);
      
      // Fallback response for API failures
      return NextResponse.json({
        response: "I apologize, but I'm having trouble accessing the information system right now. Please try again later or contact support if this persists.",
        error: apiError.message
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 