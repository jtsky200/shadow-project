/**
 * Basic Manual Setup Script
 * Creates the necessary files for the document viewer without using pdf-parse
 */

import fs from 'fs-extra';
import path from 'path';

// Configuration for the manuals
const manuals = [
  {
    id: 'lyriq-manual',
    title: 'LYRIQ Owner\'s Manual',
    filename: 'LYRIQ-24-Owner-Manual-EU-EN.pdf',
    year: '2024',
    model: 'LYRIQ',
    totalPages: 350,  // Approximate
    processedPages: 10
  },
  {
    id: 'lyriq-specifications',
    title: 'LYRIQ Specifications',
    filename: '2024-CADILLAC-LYRIQ-SPECIFICATIONS-ENGLISH.pdf',
    year: '2024',
    model: 'LYRIQ',
    totalPages: 15,   // Approximate
    processedPages: 10
  },
  {
    id: 'lyriq-quickstart',
    title: 'LYRIQ Quick Start Guide',
    filename: 'GME_Cadillac_LYRIQ_QUICKSTART_GUIDE_EN.pdf',
    year: '2024',
    model: 'LYRIQ',
    totalPages: 40,   // Approximate
    processedPages: 10
  },
  {
    id: 'optiq-manual',
    title: 'OPTIQ Owner\'s Manual',
    filename: '2025-optiq-owners-manual.pdf',
    year: '2025',
    model: 'OPTIQ',
    totalPages: 300,  // Approximate
    processedPages: 10
  }
];

// Sample content for each manual
const sampleContent = {
  'lyriq-manual': [
    "# CADILLAC LYRIQ OWNER'S MANUAL\n\nThank you for choosing the Cadillac LYRIQ, Cadillac's first all-electric vehicle built on GM's Ultium platform.",
    "## INTRODUCTION\n\nThis manual provides information on the operation and maintenance of your Cadillac LYRIQ. It also provides important safety information. Read this manual thoroughly to ensure proper operation and maintenance of your vehicle.",
    "## VEHICLE OVERVIEW\n\nThe Cadillac LYRIQ features a 33-inch diagonal LED display, Super Cruise technology, and a state-of-the-art battery system providing up to 530 km of range.",
    "## CHARGING\n\nYour Cadillac LYRIQ can be charged at home using the standard Mobile Charging Cable, or at public charging stations. For fastest charging, use DC fast charging stations.",
    "## BATTERY SYSTEM\n\nThe LYRIQ features a 102 kWh Ultium battery with active liquid cooling, providing optimal performance in various conditions. The battery supports DC fast charging at up to 190 kW."
  ],
  'lyriq-specifications': [
    "# CADILLAC LYRIQ SPECIFICATIONS\n\nThe following information outlines the technical specifications of your Cadillac LYRIQ.",
    "## DIMENSIONS\n\nLength: 4,996 mm\nWidth: 1,977 mm\nHeight: 1,623 mm\nWheelbase: 3,094 mm\nGround Clearance: 151 mm",
    "## PERFORMANCE\n\nPower Output: 388 kW\nTorque: 610 Nm\nDrivetrain: AWD\n0-100 km/h Acceleration: 4.9 seconds",
    "## BATTERY SYSTEM\n\nBattery Type: Lithium-ion with Ultium technology\nBattery Capacity: 102 kWh usable\nRange: 530 km (WLTP)\nFast Charging: 200 km in 10 minutes at 190 kW",
    "## AWARDS\n\nThe Cadillac LYRIQ is the German Car of the Year 2025 in the Luxury Category, the first American brand to receive this award."
  ],
  'lyriq-quickstart': [
    "# CADILLAC LYRIQ QUICK START GUIDE\n\nThis guide will help you get familiar with the key features of your new Cadillac LYRIQ.",
    "## GETTING STARTED\n\nTo start your LYRIQ, simply press the brake pedal and press the START button while the key fob is in the vehicle.",
    "## DIGITAL DISPLAY\n\nThe 33-inch diagonal LED display provides all vehicle information and infotainment controls. Use touch or voice commands to interact with the system.",
    "## SUPER CRUISE\n\nYour LYRIQ features Super Cruise, Cadillac's hands-free driver assistance technology for compatible roads. Look for the light bar on the steering wheel to guide you.",
    "## ONE-PEDAL DRIVING\n\nThe LYRIQ offers one-pedal driving, allowing you to accelerate and decelerate using only the accelerator pedal. Release the pedal to slow down and come to a complete stop."
  ],
  'optiq-manual': [
    "# CADILLAC OPTIQ OWNER'S MANUAL\n\nThank you for choosing the Cadillac OPTIQ, Cadillac's compact electric luxury crossover.",
    "## INTRODUCTION\n\nThis manual provides essential information about your Cadillac OPTIQ. Read it thoroughly to familiarize yourself with your vehicle's features and operation.",
    "## VEHICLE OVERVIEW\n\nThe Cadillac OPTIQ features premium electric performance in a compact crossover design, with advanced technology and luxury amenities.",
    "## CHARGING\n\nYour Cadillac OPTIQ supports both AC and DC fast charging. Use the included Mobile Charging Cable for home charging or access public charging networks.",
    "## BATTERY SYSTEM\n\nThe OPTIQ features a 74 kWh battery providing up to 465 km of range (WLTP). The battery supports fast charging up to 150 kW."
  ]
};

async function main() {
  try {
    console.log('Starting manual setup process...');
    
    // Ensure base directory exists
    const baseDir = './public/assets/manuals';
    fs.ensureDirSync(baseDir);
    
    // Create directories and files for each manual
    for (const manual of manuals) {
      console.log(`Setting up manual: ${manual.title}`);
      
      // Create manual directory
      const manualDir = path.join(baseDir, manual.id);
      fs.ensureDirSync(manualDir);
      
      // Create metadata.json
      const metadata = {
        ...manual,
        lastProcessed: new Date().toISOString()
      };
      
      const metadataPath = path.join(manualDir, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(`Created metadata: ${metadataPath}`);
      
      // Create content.json
      const content = [];
      const sampleTexts = sampleContent[manual.id] || [];
      
      for (let i = 0; i < manual.processedPages; i++) {
        const pageNum = i + 1;
        content.push({
          page: pageNum,
          image: `page-${pageNum}.jpg`,
          ocrText: sampleTexts[i % sampleTexts.length] || `Sample OCR text for page ${pageNum}`,
          rawText: sampleTexts[i % sampleTexts.length] || `Sample raw text for page ${pageNum}`,
          tags: ['sample']
        });
      }
      
      const contentPath = path.join(manualDir, 'content.json');
      fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));
      console.log(`Created content: ${contentPath}`);
      
      // Create sample image files
      for (let i = 0; i < manual.processedPages; i++) {
        const pageNum = i + 1;
        const imagePath = path.join(manualDir, `page-${pageNum}.jpg`);
        
        // Copy favicon as a placeholder image
        if (fs.existsSync('./public/favicon.ico')) {
          fs.copyFileSync('./public/favicon.ico', imagePath);
        }
      }
      console.log(`Created placeholder images for ${manual.id}`);
    }
    
    // Create index.json
    const indexData = manuals.map(manual => ({
      ...manual,
      success: true,
      path: manual.id,
      lastProcessed: new Date().toISOString()
    }));
    
    const indexPath = path.join(baseDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`Created index file: ${indexPath}`);
    
    console.log('Manual setup completed successfully!');
  } catch (error) {
    console.error('Error during setup process:', error);
  }
}

// Run the script
main(); 