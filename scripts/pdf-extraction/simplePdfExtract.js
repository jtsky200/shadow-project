/**
 * Simplified PDF Extraction Script
 * Just processes a single PDF to validate the setup
 */

import fs from 'fs-extra';
import path from 'path';
import pdfParse from 'pdf-parse';
import pdfPoppler from 'pdf-poppler';

// Configuration
const config = {
  pdfPath: './pdf/LYRIQ-24-Owner-Manual-EU-EN.pdf',
  outputDir: './public/assets/manuals/lyriq-manual',
  tempDir: './temp-output-pages',
  imageFormat: 'jpg',
  imageQuality: 80,
  dpi: 150,
  maxPages: 5
};

// Ensure directories exist
fs.ensureDirSync(config.outputDir);
fs.ensureDirSync(config.tempDir);

async function main() {
  try {
    console.log('Starting PDF extraction process...');
    
    // Step 1: Extract text from PDF
    console.log(`Processing PDF: ${config.pdfPath}`);
    const dataBuffer = fs.readFileSync(config.pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Save the raw text to file
    const rawTextPath = path.join(config.outputDir, 'manual-text.txt');
    fs.writeFileSync(rawTextPath, pdfData.text);
    console.log(`Raw text extracted and saved to ${rawTextPath}`);
    
    // Create metadata
    const metadata = {
      id: 'lyriq-manual',
      title: 'LYRIQ Owner\'s Manual',
      year: '2024',
      model: 'LYRIQ',
      totalPages: pdfData.numpages,
      processedPages: Math.min(pdfData.numpages, config.maxPages),
      lastProcessed: new Date().toISOString()
    };
    
    // Save metadata
    const metadataPath = path.join(config.outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadata saved to ${metadataPath}`);
    
    // Create index file
    const indexData = [
      {
        id: 'lyriq-manual',
        title: 'LYRIQ Owner\'s Manual',
        filename: 'LYRIQ-24-Owner-Manual-EU-EN.pdf',
        year: '2024',
        model: 'LYRIQ',
        totalPages: pdfData.numpages,
        processedPages: Math.min(pdfData.numpages, config.maxPages),
        lastProcessed: new Date().toISOString(),
        success: true,
        path: 'lyriq-manual'
      }
    ];
    
    const indexPath = path.join('./public/assets/manuals', 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`Index file created at ${indexPath}`);
    
    // Create content.json with simplified data
    const contentData = [];
    
    // Split text into pages (simple approach)
    const textByPage = pdfData.text.split('\n\n\n\n').slice(0, config.maxPages);
    
    // Create entries for each page
    for (let i = 0; i < Math.min(textByPage.length, config.maxPages); i++) {
      const pageNum = i + 1;
      contentData.push({
        page: pageNum,
        image: `page-${pageNum}.${config.imageFormat}`, // This will be placeholder
        ocrText: '', // No OCR for this simple version
        rawText: textByPage[i] || '',
        tags: []
      });
    }
    
    // Save content data
    const contentPath = path.join(config.outputDir, 'content.json');
    fs.writeFileSync(contentPath, JSON.stringify(contentData, null, 2));
    console.log(`Content data saved to ${contentPath}`);
    
    // Create a placeholder image file
    const placeholderPath = path.join(config.outputDir, `page-1.${config.imageFormat}`);
    if (!fs.existsSync(placeholderPath)) {
      // Simple approach - copy favicon as placeholder
      if (fs.existsSync('./public/favicon.ico')) {
        fs.copyFileSync('./public/favicon.ico', placeholderPath);
        console.log(`Created placeholder image at ${placeholderPath}`);
      }
    }
    
    console.log('PDF extraction completed successfully!');
  } catch (error) {
    console.error('Error during extraction process:', error);
  }
}

// Run the script
main(); 