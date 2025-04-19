#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get current directory in ES modules
const cwd = process.cwd();

// Configuration
const MANUALS_DIR = path.join(cwd, 'public/assets/manuals');
const OUTPUT_DIR = path.join(cwd, 'public/assets/manuals/processed');
const MANUAL_INDEX_PATH = path.join(MANUALS_DIR, 'index.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load manual index
let manualIndex = [];
if (fs.existsSync(MANUAL_INDEX_PATH)) {
  try {
    manualIndex = JSON.parse(fs.readFileSync(MANUAL_INDEX_PATH, 'utf8'));
  } catch (err) {
    console.error('Error reading manual index:', err);
    manualIndex = [];
  }
}

// Process each manual
function processManual(manual) {
  console.log(`Processing manual: ${manual.title}`);
  
  const inputPath = path.join(MANUALS_DIR, manual.path);
  if (!fs.existsSync(inputPath)) {
    console.error(`Manual file not found: ${inputPath}`);
    return false;
  }
  
  // Create output directory for this manual
  const manualDir = path.join(OUTPUT_DIR, manual.id);
  if (!fs.existsSync(manualDir)) {
    fs.mkdirSync(manualDir, { recursive: true });
  }
  
  // Extract text using pdf-parse (assuming it's installed)
  try {
    console.log(`Extracting text from ${manual.path}`);
    
    // Extract text using the extractPdfToWebAssets script
    execSync(`node scripts/extractPdfToWebAssets.js --input=${inputPath} --output=${manualDir} --max-pages=${manual.pages || 100}`);
    
    // Create chunks for retrieval
    const contentFile = path.join(manualDir, 'content.json');
    if (fs.existsSync(contentFile)) {
      const content = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
      
      // Create chunks with context
      const chunks = [];
      let currentChunk = '';
      let chunkIndex = 0;
      
      for (const page of content.pages) {
        const pageText = page.text;
        if (!pageText) continue;
        
        // Split page into paragraphs
        const paragraphs = pageText.split('\n\n').filter(p => p.trim().length > 0);
        
        for (const paragraph of paragraphs) {
          // If adding this paragraph would exceed chunk size, save current chunk and start new one
          if (currentChunk.length + paragraph.length > 1500 && currentChunk.length > 0) {
            chunks.push({
              id: `${manual.id}-chunk-${chunkIndex}`,
              text: currentChunk,
              source: `${manual.title}, Page ${page.pageNumber}`,
              manualId: manual.id
            });
            currentChunk = paragraph;
            chunkIndex++;
          } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
          }
        }
      }
      
      // Save the last chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push({
          id: `${manual.id}-chunk-${chunkIndex}`,
          text: currentChunk,
          source: `${manual.title}`,
          manualId: manual.id
        });
      }
      
      // Save chunks to file
      fs.writeFileSync(
        path.join(manualDir, 'chunks.json'),
        JSON.stringify({ chunks }, null, 2)
      );
      
      console.log(`Created ${chunks.length} chunks for ${manual.title}`);
      
      // Update manual metadata with processed status
      manual.processed = true;
      manual.lastProcessed = new Date().toISOString();
      manual.chunks = chunks.length;
      
      return true;
    }
  } catch (err) {
    console.error(`Error processing manual ${manual.title}:`, err);
  }
  
  return false;
}

// Process all manuals in the index
let updated = false;
for (const manual of manualIndex) {
  const success = processManual(manual);
  if (success) {
    updated = true;
  }
}

// Save updated index
if (updated) {
  fs.writeFileSync(MANUAL_INDEX_PATH, JSON.stringify(manualIndex, null, 2));
  console.log('Manual index updated successfully');
}

console.log('Manual processing complete'); 