import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { OpenAI } from 'openai';

// Configure environment
config();

// Configure paths
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const inputPath = join(rootDir, 'manual-content.json');
const outputPath = join(rootDir, 'manual-embeddings.json');

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Delay function to respect API rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function embedChunks() {
  console.log('📚 Starting manual content embedding...');
  
  try {
    // Load manual content
    console.log(`📄 Loading manual content from ${inputPath}`);
    const manual = JSON.parse(readFileSync(inputPath, 'utf-8'));
    console.log(`✅ Loaded ${manual.length} entries`);
    
    // Process chunks
    const chunks = manual.map(entry => ({
      page: entry.pageNumber,
      title: entry.title || '',
      text: (entry.ocrText || '') + (entry.rawText ? `\n${entry.rawText}` : ''),
    }))
    .filter(chunk => chunk.text.trim().length > 0);
    
    console.log(`🔍 Found ${chunks.length} text chunks to process`);
    
    // Embed chunks
    const embedded = [];
    let index = 0;
    
    for (const chunk of chunks) {
      console.log(`⏳ Processing chunk ${++index}/${chunks.length}: ${chunk.title || `Page ${chunk.page}`}`);
      
      try {
        // Truncate text if too long (token limits)
        const text = chunk.text.slice(0, 4000);
        
        const res = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        
        embedded.push({
          page: chunk.page,
          title: chunk.title,
          text: text,
          embedding: res.data[0].embedding,
        });
        
        console.log(`✅ Processed chunk ${index}/${chunks.length}`);
        
        // Delay to respect rate limits
        await delay(200);
      } catch (error) {
        console.error(`❌ Error embedding chunk ${index}:`, error.message);
        // Continue with next chunk
      }
    }
    
    // Save results
    console.log(`💾 Saving ${embedded.length} embedded chunks to ${outputPath}`);
    writeFileSync(outputPath, JSON.stringify(embedded, null, 2));
    console.log('✅ Embedding complete!');
  } catch (error) {
    console.error('❌ Embedding process failed:', error);
    process.exit(1);
  }
}

// Run the embedding process
embedChunks(); 