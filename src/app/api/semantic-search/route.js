import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vectorA, vectorB) {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request) {
  try {
    const { query, manualId, threshold = 0.7 } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }
    
    if (!manualId) {
      return NextResponse.json(
        { error: "Manual ID is required" },
        { status: 400 }
      );
    }
    
    // Generate embedding for the query
    const queryEmbeddingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: query }),
    });
    
    if (!queryEmbeddingResponse.ok) {
      throw new Error("Failed to generate query embedding");
    }
    
    const { embedding: queryEmbedding } = await queryEmbeddingResponse.json();
    
    // Try multiple paths for embeddings since we're not sure where they might be
    let embeddingsData = null;
    const possiblePaths = [
      path.join(process.cwd(), "public", "assets", "manuals", manualId, "embeddings.json"),
      path.join(process.cwd(), "public", "assets", "manual", "embeddings.json"),
      path.join(process.cwd(), "public", "assets", "manual", "manual-content.json")
    ];
    
    for (const embeddingsPath of possiblePaths) {
      if (fs.existsSync(embeddingsPath)) {
        embeddingsData = JSON.parse(fs.readFileSync(embeddingsPath, "utf-8"));
        break;
      }
    }
    
    if (!embeddingsData) {
      // Fallback to manual-content.json directly
      const manualContentPath = path.join(process.cwd(), "public", "assets", "manual", "manual-content.json");
      if (fs.existsSync(manualContentPath)) {
        embeddingsData = JSON.parse(fs.readFileSync(manualContentPath, "utf-8"));
      } else {
        return NextResponse.json(
          { error: "No embeddings or manual content found" },
          { status: 404 }
        );
      }
    }
    
    // Calculate similarity scores
    // Adapt to different possible data structures
    const results = embeddingsData.map(item => {
      // Create a consistent structure regardless of input format
      const section = {
        sectionId: item.sectionId || item.page || item.id || "unknown",
        title: item.title || `Page ${item.page}` || "Section",
        // Use the available text content from the item
        content: item.content || item.ocrText || item.rawText || "",
        embedding: item.embedding
      };
      
      if (section.embedding) {
        section.similarity = cosineSimilarity(queryEmbedding, section.embedding);
      } else {
        section.similarity = 0;
      }
      
      return section;
    })
    .filter(result => result.similarity >= threshold && result.content)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Return top 5 results
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in semantic search:", error);
    return NextResponse.json(
      { error: "Semantic search failed: " + error.message },
      { status: 500 }
    );
  }
} 