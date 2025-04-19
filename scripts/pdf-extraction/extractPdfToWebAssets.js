'use strict';

/**
 * PDF to Web Assets Extraction Script
 * 
 * This script extracts text and images from PDF files and converts them to web-friendly formats.
 * It uses pdf-parse for text extraction, pdf-poppler for image rendering, and tesseract.js for OCR.
 */

import fs from 'fs-extra';
import path from 'path';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import pdfPoppler from 'pdf-poppler';

/**
 * Tag manual pages based on text content
 * @param {string} text - The text content to analyze
 * @returns {string[]} - Array of tags that apply to the content
 */
const tagManualPage = (text) => {
  const tags = [];

  const tagRules = [
    { tag: 'charging', keywords: ['charge', 'charging', 'connector', 'plug', 'ac', 'dc', 'station'] },
    { tag: 'infotainment', keywords: ['display', 'touchscreen', 'navigation', 'infotainment', 'map', 'media'] },
    { tag: 'safety', keywords: ['airbag', 'brake', 'warning', 'collision', 'assist', 'alert'] },
    { tag: 'maintenance', keywords: ['maintenance', 'service', 'inspection', 'oil', 'fluid', 'battery'] },
    { tag: 'comfort', keywords: ['climate', 'seat', 'heated', 'lumbar', 'temperature'] },
    { tag: 'driving', keywords: ['drive', 'acceleration', 'regen', 'mode', 'cruise'] },
  ];

  const lowerText = text.toLowerCase();

  for (const rule of tagRules) {
    if (rule.keywords.some(kw => lowerText.includes(kw))) {
      tags.push(rule.tag);
    }
  }

  return tags;
};

// Base configuration
const baseConfig = {
  pdfDir: './pdf', // Directory containing PDF files
  outputBaseDir: './public/assets/manuals', // Base output directory for all generated files
  tempDir: './temp-output-pages', // Temporary directory for processing
  ocrLanguage: 'eng', // OCR language ('eng' for English, 'deu' for German, etc.)
  imageFormat: 'jpg', // Output image format (jpg, png)
  imageQuality: 80, // Image quality for JPEGs (1-100)
  dpi: 150, // DPI for image rendering
  maxPagesToProcess: 10 // Maximum number of pages to process per PDF (to avoid long processing times)
};

// PDF files to process and their metadata
const pdfFiles = [
  { 
    filename: 'LYRIQ-24-Owner-Manual-EU-EN.pdf',
    id: 'lyriq-manual',
    title: 'LYRIQ Owner\'s Manual',
    year: '2024',
    model: 'LYRIQ'
  },
  { 
    filename: '2024-CADILLAC-LYRIQ-SPECIFICATIONS-ENGLISH.pdf',
    id: 'lyriq-specifications',
    title: 'LYRIQ Specifications',
    year: '2024',
    model: 'LYRIQ'
  },
  { 
    filename: 'GME_Cadillac_LYRIQ_QUICKSTART_GUIDE_EN.pdf',
    id: 'lyriq-quickstart',
    title: 'LYRIQ Quick Start Guide',
    year: '2024',
    model: 'LYRIQ'
  },
  { 
    filename: '2025-optiq-owners-manual.pdf',
    id: 'optiq-manual',
    title: 'OPTIQ Owner\'s Manual',
    year: '2025',
    model: 'OPTIQ'
  }
];

// Ensure base directories exist
fs.ensureDirSync(baseConfig.outputBaseDir);
fs.ensureDirSync(baseConfig.tempDir);

/**
 * Extract text from PDF using pdf-parse
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} outputDir - Output directory for the extracted text
 * @returns {Promise<object>} Extracted text and metadata
 */
async function extractTextFromPdf(pdfPath, outputDir) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  // Save the raw text to file
  const rawTextPath = path.join(outputDir, 'manual-text.txt');
  fs.writeFileSync(rawTextPath, data.text);
  
  console.log(`Raw text extracted and saved to ${rawTextPath}`);
  
  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info
  };
}

/**
 * Render PDF pages to images using pdf-poppler
 * @param {string} pdfPath - Path to the PDF file
 * @param {number} numPages - Number of pages in the PDF
 * @param {object} config - Configuration options
 * @returns {Promise<string[]>} Array of paths to the generated images
 */
async function renderPdfToImages(pdfPath, numPages, config) {
  const pagesToProcess = Math.min(numPages, config.maxPagesToProcess);
  
  const opts = {
    format: config.imageFormat,
    out_dir: config.tempDir,
    out_prefix: 'page',
    firstPage: 1,
    lastPage: pagesToProcess,
    density: config.dpi,
    quality: config.imageQuality
  };
  
  try {
    await pdfPoppler.pdf2image(pdfPath, opts);
    console.log(`PDF rendered to images in ${config.tempDir} (${pagesToProcess} pages)`);
    
    // Get the list of generated image files
    const imageFiles = [];
    for (let i = 1; i <= pagesToProcess; i++) {
      const imagePath = path.join(config.tempDir, `page-${i}.${config.imageFormat}`);
      if (fs.existsSync(imagePath)) {
        imageFiles.push(imagePath);
      }
    }
    
    return imageFiles;
  } catch (error) {
    console.error('Error rendering PDF to images:', error);
    throw error;
  }
}

/**
 * Perform OCR on image files using tesseract.js
 * @param {string[]} imageFiles - Array of paths to image files
 * @param {string} outputDir - Output directory for OCR results
 * @param {string} ocrLanguage - Language for OCR
 * @returns {Promise<object[]>} Array of OCR results with page numbers
 */
async function performOcr(imageFiles, outputDir, ocrLanguage) {
  const worker = await createWorker(ocrLanguage);
  const ocrResults = [];
  const ocrTexts = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const pageNum = i + 1;
    console.log(`Processing OCR for page ${pageNum}/${imageFiles.length}...`);
    
    const { data } = await worker.recognize(imageFiles[i]);
    ocrResults.push({
      page: pageNum,
      text: data.text
    });
    ocrTexts.push(data.text);
    
    // Save individual OCR text
    const ocrPagePath = path.join(outputDir, `ocr-page-${pageNum}.txt`);
    fs.writeFileSync(ocrPagePath, data.text);
  }
  
  // Save combined OCR text
  const ocrFullPath = path.join(outputDir, 'ocr-full.txt');
  fs.writeFileSync(ocrFullPath, ocrTexts.join('\n\n--- Page Break ---\n\n'));
  
  await worker.terminate();
  console.log(`OCR completed for ${imageFiles.length} pages`);
  
  return ocrResults;
}

/**
 * Create markdown files for each page
 * @param {object[]} pageData - Array of page data objects
 * @param {string} outputDir - Output directory for markdown files
 * @param {string} imageFormat - Image format for references
 */
function createMarkdownFiles(pageData, outputDir, imageFormat) {
  pageData.forEach(page => {
    const mdContent = `## Page ${page.page}
![Page ${page.page}](page-${page.page}.${imageFormat})

### OCR Text
\`\`\`
${page.ocrText}
\`\`\`

### Parsed PDF Text
\`\`\`
${page.rawText}
\`\`\`
`;
    
    const mdPath = path.join(outputDir, `page-${page.page}.md`);
    fs.writeFileSync(mdPath, mdContent);
  });
  
  console.log(`Markdown files created in ${outputDir}`);
}

/**
 * Copy image files from temporary directory to output directory
 * @param {string[]} imageFiles - Array of paths to image files
 * @param {string} outputDir - Output directory for copied images
 * @returns {string[]} Array of new image paths
 */
function copyImagesToOutputDir(imageFiles, outputDir) {
  const newPaths = [];
  
  imageFiles.forEach(imagePath => {
    const fileName = path.basename(imagePath);
    const newPath = path.join(outputDir, fileName);
    fs.copySync(imagePath, newPath);
    newPaths.push(newPath);
  });
  
  console.log(`Images copied to ${outputDir}`);
  return newPaths;
}

/**
 * Process a single PDF file
 * @param {object} pdfInfo - Information about the PDF file
 * @returns {Promise<object>} Processing results
 */
async function processPdf(pdfInfo) {
  const pdfPath = path.join(baseConfig.pdfDir, pdfInfo.filename);
  const outputDir = path.join(baseConfig.outputBaseDir, pdfInfo.id);
  
  // Create config for this PDF
  const config = {
    ...baseConfig,
    outputDir
  };
  
  // Ensure output directory exists
  fs.ensureDirSync(outputDir);
  
  try {
    console.log(`Processing PDF: ${pdfInfo.filename}`);
    
    // Step 1: Extract text from PDF
    const pdfData = await extractTextFromPdf(pdfPath, outputDir);
    
    // Step 2: Render PDF pages to images
    const imageFiles = await renderPdfToImages(pdfPath, pdfData.numPages, config);
    
    // Step 3: Copy images to output directory
    copyImagesToOutputDir(imageFiles, outputDir);
    
    // Step 4: Perform OCR on images
    const ocrResults = await performOcr(imageFiles, outputDir, config.ocrLanguage);
    
    // Step 5: Split PDF text by pages (approximate)
    const pagesToProcess = Math.min(pdfData.numPages, config.maxPagesToProcess);
    const rawTextByPage = pdfData.text.split('\n\n\n\n')
      .slice(0, pagesToProcess);
    
    // Step 6: Prepare final JSON data
    const jsonData = [];
    for (let i = 0; i < Math.min(ocrResults.length, pagesToProcess); i++) {
      const pageNum = i + 1;
      const ocrText = ocrResults[i].text;
      const rawText = rawTextByPage[i] || '';
      
      // Generate tags based on combined OCR and raw text
      const combinedText = ocrText + ' ' + rawText;
      const tags = tagManualPage(combinedText);
      
      jsonData.push({
        page: pageNum,
        image: `page-${pageNum}.${config.imageFormat}`,
        ocrText: ocrText,
        rawText: rawText,
        tags: tags
      });
    }
    
    // Add metadata
    const metadataJson = {
      id: pdfInfo.id,
      title: pdfInfo.title,
      filename: pdfInfo.filename,
      year: pdfInfo.year,
      model: pdfInfo.model,
      totalPages: pdfData.numPages,
      processedPages: pagesToProcess,
      lastProcessed: new Date().toISOString()
    };
    
    // Step 7: Save JSON data
    const contentJsonPath = path.join(outputDir, 'content.json');
    fs.writeFileSync(contentJsonPath, JSON.stringify(jsonData, null, 2));
    
    const metadataJsonPath = path.join(outputDir, 'metadata.json');
    fs.writeFileSync(metadataJsonPath, JSON.stringify(metadataJson, null, 2));
    
    console.log(`JSON data saved to ${contentJsonPath}`);
    
    // Step 8: Create markdown files
    createMarkdownFiles(jsonData, outputDir, config.imageFormat);
    
    return {
      id: pdfInfo.id,
      success: true,
      pagesProcessed: pagesToProcess
    };
  } catch (error) {
    console.error(`Error processing PDF ${pdfInfo.filename}:`, error);
    return {
      id: pdfInfo.id,
      success: false,
      error: error.message
    };
  }
}

/**
 * Create index file with metadata about all processed PDFs
 * @param {object[]} results - Results of PDF processing
 */
function createIndexFile(results) {
  const indexData = results.map(result => {
    if (!result.success) {
      return {
        id: result.id,
        success: false,
        error: result.error
      };
    }
    
    // Read metadata from file
    const metadataPath = path.join(baseConfig.outputBaseDir, result.id, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      return {
        ...metadata,
        success: true,
        path: result.id
      };
    }
    
    return {
      id: result.id,
      success: true,
      pagesProcessed: result.pagesProcessed,
      path: result.id
    };
  });
  
  const indexPath = path.join(baseConfig.outputBaseDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`Index file created at ${indexPath}`);
}

/**
 * Main function to coordinate the extraction process
 */
async function main() {
  try {
    console.log('Starting PDF extraction process for all files');
    
    // Process each PDF file in sequence
    const results = [];
    for (const pdfInfo of pdfFiles) {
      // Clean up temporary directory before each processing
      fs.emptyDirSync(baseConfig.tempDir);
      
      const result = await processPdf(pdfInfo);
      results.push(result);
    }
    
    // Create index file with metadata
    createIndexFile(results);
    
    // Final cleanup
    fs.removeSync(baseConfig.tempDir);
    
    console.log('PDF extraction process completed successfully!');
  } catch (error) {
    console.error('Error during extraction process:', error);
  }
}

// Execute the main function
main(); 