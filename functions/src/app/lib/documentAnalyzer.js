/**
 * Document Analyzer Service
 * 
 * This module provides functions to analyze uploaded documents,
 * extract structured data, and categorize them based on content.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Document types that can be detected
export const DOCUMENT_TYPES = {
  SPECIFICATION: 'specification',
  MANUAL: 'manual',
  GUIDE: 'guide',
  UNKNOWN: 'unknown'
};

// Document categories for classification
export const DOCUMENT_CATEGORIES = {
  LYRIQ: 'lyriq',
  OPTIQ: 'optiq',
  GENERAL: 'general'
};

/**
 * Analyze a document to determine its type and extract relevant data
 * @param {string} filePath - Path to the document file
 * @param {string} fileName - Original file name
 * @returns {Promise<object>} - Analysis results with type, category, and extracted data
 */
export async function analyzeDocument(filePath, fileName) {
  const fileType = getFileType(fileName);
  
  // If not a supported file type, return unknown
  if (!fileType) {
    return {
      type: DOCUMENT_TYPES.UNKNOWN,
      category: DOCUMENT_CATEGORIES.GENERAL,
      data: {
        title: fileName,
        description: `Uploaded document: ${fileName}`,
        fileSize: getFileSize(filePath),
        path: filePath
      }
    };
  }
  
  // Extract text content based on file type
  const textContent = await extractTextContent(filePath, fileType);
  
  // Classify document type and category based on content
  const { type, category } = classifyDocument(textContent, fileName);
  
  // Extract structured data based on document type
  const extractedData = extractStructuredData(textContent, type, category);
  
  return {
    type,
    category,
    data: {
      ...extractedData,
      title: extractedData.title || getDocumentTitle(fileName, type, category),
      description: extractedData.description || `${type.charAt(0).toUpperCase() + type.slice(1)} document for ${category.toUpperCase()}`,
      fileSize: getFileSize(filePath),
      path: filePath,
      fileName
    }
  };
}

/**
 * Get the file type from file name
 * @param {string} fileName - File name
 * @returns {string|null} - File type or null if not supported
 */
function getFileType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const supportedTypes = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'doc',
    'txt': 'txt',
    'json': 'json'
  };
  
  return supportedTypes[extension] || null;
}

/**
 * Get file size in a readable format
 * @param {string} filePath - Path to the file
 * @returns {string} - File size (e.g., "550 KB")
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 'Unknown size';
  }
}

/**
 * Extract text content from a document
 * @param {string} filePath - Path to the document file
 * @param {string} fileType - Type of file (pdf, docx, etc.)
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextContent(filePath, fileType) {
  // In a real implementation, this would use libraries like pdf-parse, mammoth, etc.
  // For this demo, we'll read text files directly and simulate for other formats
  
  if (fileType === 'txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }
  
  if (fileType === 'json') {
    try {
      const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return JSON.stringify(jsonContent, null, 2);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return '';
    }
  }
  
  // For PDFs and DOCX, we'd use appropriate libraries
  // Simulating content extraction for demo purposes
  return `
    CADILLAC EV SPECIFICATIONS
    Model: LYRIQ
    Year: 2024
    
    PERFORMANCE
    Motor Type: Permanent magnet electric motors
    Power Output: 400 kW
    Torque: 610 Nm
    Drivetrain: AWD
    
    BATTERY SYSTEM
    Battery Type: Lithium-ion with Ultium technology
    Battery Capacity: 102 kWh
    Range: 530 km (WLTP)
    
    DIMENSIONS
    Length: 4,996 mm
    Width: 1,977 mm
    Height: 1,623 mm
    Wheelbase: 3,094 mm
    
    WEIGHT
    Curb Weight: 2,577 kg
    GVWR: 3,175 kg
  `;
}

/**
 * Classify a document based on its content
 * @param {string} textContent - Extracted text content
 * @param {string} fileName - Original file name
 * @returns {object} - Document type and category
 */
function classifyDocument(textContent, fileName) {
  const lowerContent = textContent.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  // Check for specification documents
  if (
    lowerContent.includes('specifications') || 
    lowerContent.includes('specs') || 
    lowerFileName.includes('spec') ||
    (
      lowerContent.includes('technical') && 
      (lowerContent.includes('data') || lowerContent.includes('details'))
    )
  ) {
    // Determine which vehicle
    if (lowerContent.includes('lyriq')) {
      return {
        type: DOCUMENT_TYPES.SPECIFICATION,
        category: DOCUMENT_CATEGORIES.LYRIQ
      };
    } else if (lowerContent.includes('optiq')) {
      return {
        type: DOCUMENT_TYPES.SPECIFICATION,
        category: DOCUMENT_CATEGORIES.OPTIQ
      };
    } else {
      return {
        type: DOCUMENT_TYPES.SPECIFICATION,
        category: DOCUMENT_CATEGORIES.GENERAL
      };
    }
  }
  
  // Check for manuals
  if (
    lowerContent.includes('manual') || 
    lowerContent.includes('guide') || 
    lowerFileName.includes('manual') ||
    lowerFileName.includes('guide')
  ) {
    // Check if it's a quick guide
    if (
      lowerContent.includes('quick') && 
      lowerContent.includes('guide')
    ) {
      if (lowerContent.includes('lyriq')) {
        return {
          type: DOCUMENT_TYPES.GUIDE,
          category: DOCUMENT_CATEGORIES.LYRIQ
        };
      } else if (lowerContent.includes('optiq')) {
        return {
          type: DOCUMENT_TYPES.GUIDE,
          category: DOCUMENT_CATEGORIES.OPTIQ
        };
      } else {
        return {
          type: DOCUMENT_TYPES.GUIDE,
          category: DOCUMENT_CATEGORIES.GENERAL
        };
      }
    } else {
      // Full manual
      if (lowerContent.includes('lyriq')) {
        return {
          type: DOCUMENT_TYPES.MANUAL,
          category: DOCUMENT_CATEGORIES.LYRIQ
        };
      } else if (lowerContent.includes('optiq')) {
        return {
          type: DOCUMENT_TYPES.MANUAL,
          category: DOCUMENT_CATEGORIES.OPTIQ
        };
      } else {
        return {
          type: DOCUMENT_TYPES.MANUAL,
          category: DOCUMENT_CATEGORIES.GENERAL
        };
      }
    }
  }
  
  // Default to unknown
  return {
    type: DOCUMENT_TYPES.UNKNOWN,
    category: DOCUMENT_CATEGORIES.GENERAL
  };
}

/**
 * Extract structured data from document content
 * @param {string} textContent - Document text content
 * @param {string} type - Document type
 * @param {string} category - Document category
 * @returns {object} - Structured data extracted from the document
 */
function extractStructuredData(textContent, type, category) {
  if (type === DOCUMENT_TYPES.SPECIFICATION) {
    // Extract specification data
    const motorType = extractValue(textContent, ['motor type', 'electric motor'], ':');
    const powerOutput = extractValue(textContent, ['power output', 'power', 'output'], ':');
    const torque = extractValue(textContent, ['torque'], ':');
    const drivetrain = extractValue(textContent, ['drivetrain', 'drive'], ':');
    const acceleration = extractValue(textContent, ['acceleration', '0-100', '0-60'], ':');
    const topSpeed = extractValue(textContent, ['top speed', 'maximum speed'], ':');
    
    const batteryType = extractValue(textContent, ['battery type', 'battery'], ':');
    const batteryCapacity = extractValue(textContent, ['battery capacity', 'capacity'], ':');
    const batteryCooling = extractValue(textContent, ['battery cooling', 'cooling'], ':');
    const range = extractValue(textContent, ['range', 'driving range'], ':');
    const fastCharging = extractValue(textContent, ['fast charging', 'rapid charging'], ':');
    
    const curbWeight = extractValue(textContent, ['curb weight', 'weight'], ':');
    const gvwr = extractValue(textContent, ['gvwr', 'gross vehicle weight'], ':');
    const towingCapacity = extractValue(textContent, ['towing capacity', 'towing'], ':');
    const roofLoadCapacity = extractValue(textContent, ['roof load', 'roof capacity'], ':');
    const seatingCapacity = extractValue(textContent, ['seating capacity', 'seats', 'passengers'], ':');
    
    const energyConsumption = extractValue(textContent, ['energy consumption', 'consumption', 'efficiency'], ':');
    const emissions = extractValue(textContent, ['emissions', 'co2'], ':');
    
    // Generate a title if category is known
    let title = '';
    if (category === DOCUMENT_CATEGORIES.LYRIQ) {
      title = 'LYRIQ Specifications';
    } else if (category === DOCUMENT_CATEGORIES.OPTIQ) {
      title = 'OPTIQ Specifications';
    } else {
      title = 'Cadillac EV Specifications';
    }
    
    // Extract year from text if available
    const yearMatch = textContent.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    
    return {
      id: `${category}-specifications-${uuidv4().substring(0, 8)}`,
      title,
      year,
      model: category.toUpperCase(),
      specifications: {
        performance: {
          motorType: motorType || 'Permanent magnet electric motors',
          powerOutput: powerOutput || '',
          torque: torque || '',
          drivetrain: drivetrain || '',
          acceleration: acceleration || '',
          topSpeed: topSpeed || ''
        },
        battery: {
          batteryType: batteryType || 'Lithium-ion',
          batteryCapacity: batteryCapacity || '',
          batteryCooling: batteryCooling || '',
          range: range || '',
          fastCharging: fastCharging || ''
        },
        weight: {
          curbWeight: curbWeight || '',
          gvwr: gvwr || '',
          towingCapacity: towingCapacity || '',
          roofLoadCapacity: roofLoadCapacity || '',
          seatingCapacity: seatingCapacity || ''
        },
        efficiency: {
          energyConsumption: energyConsumption || '',
          emissions: emissions || ''
        }
      }
    };
  } else {
    // For other document types, just extract basic metadata
    const titleMatch = textContent.match(/(?:title|subject):\s*([^\n]+)/i);
    const descriptionMatch = textContent.match(/(?:description|summary):\s*([^\n]+)/i);
    
    return {
      id: `${type}-${category}-${uuidv4().substring(0, 8)}`,
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      textContent: textContent.substring(0, 500) + '...' // Preview of content
    };
  }
}

/**
 * Extract a value from text using multiple possible labels
 * @param {string} text - Text to search in
 * @param {string[]} labels - Possible labels for the value
 * @param {string} separator - Separator between label and value
 * @returns {string} - Extracted value or empty string
 */
function extractValue(text, labels, separator = ':') {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*${separator}\\s*([^\\n]+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

/**
 * Generate a document title based on file name and type
 * @param {string} fileName - Original file name
 * @param {string} type - Document type
 * @param {string} category - Document category
 * @returns {string} - Generated title
 */
function getDocumentTitle(fileName, type, category) {
  // Remove extension from file name
  const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
  
  if (type === DOCUMENT_TYPES.SPECIFICATION) {
    if (category !== DOCUMENT_CATEGORIES.GENERAL) {
      return `${category.toUpperCase()} Specifications`;
    }
    return `${nameWithoutExt} Specifications`;
  }
  
  if (type === DOCUMENT_TYPES.MANUAL) {
    if (category !== DOCUMENT_CATEGORIES.GENERAL) {
      return `${category.toUpperCase()} Owner's Manual`;
    }
    return `${nameWithoutExt} Manual`;
  }
  
  if (type === DOCUMENT_TYPES.GUIDE) {
    if (category !== DOCUMENT_CATEGORIES.GENERAL) {
      return `${category.toUpperCase()} Quick Start Guide`;
    }
    return `${nameWithoutExt} Guide`;
  }
  
  // Default to file name for unknown types
  return nameWithoutExt;
}

/**
 * Store document analysis results
 * @param {object} analysisResult - Document analysis result
 * @returns {Promise<boolean>} - Success status
 */
export async function storeDocumentAnalysis(analysisResult) {
  try {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Store the document metadata in the appropriate category file
    const { type, category, data } = analysisResult;
    
    // Different storage based on document type
    if (type === DOCUMENT_TYPES.SPECIFICATION) {
      await storeSpecification(category, data);
    } else if (type === DOCUMENT_TYPES.MANUAL || type === DOCUMENT_TYPES.GUIDE) {
      await storeManualOrGuide(type, category, data);
    }
    
    // Store in history collection for all documents
    await storeInHistory(type, category, data);
    
    return true;
  } catch (error) {
    console.error('Error storing document analysis:', error);
    return false;
  }
}

/**
 * Store specification data
 * @param {string} category - Document category (lyriq, optiq, etc.)
 * @param {object} data - Specification data
 * @returns {Promise<void>}
 */
async function storeSpecification(category, data) {
  const specsFile = path.join(process.cwd(), 'data', 'specifications.json');
  
  let specs = [];
  if (fs.existsSync(specsFile)) {
    specs = JSON.parse(fs.readFileSync(specsFile, 'utf-8'));
  }
  
  // Check if we already have a spec for this model
  const existingIndex = specs.findIndex(spec => 
    spec.model.toLowerCase() === data.model.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    // Update existing spec
    specs[existingIndex] = {
      ...specs[existingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new spec
    specs.push({
      ...data,
      createdAt: new Date().toISOString()
    });
  }
  
  // Save back to file
  fs.writeFileSync(specsFile, JSON.stringify(specs, null, 2));
}

/**
 * Store manual or guide data
 * @param {string} type - Document type
 * @param {string} category - Document category
 * @param {object} data - Document data
 * @returns {Promise<void>}
 */
async function storeManualOrGuide(type, category, data) {
  const manualsFile = path.join(process.cwd(), 'data', 'manuals.json');
  
  let manuals = [];
  if (fs.existsSync(manualsFile)) {
    manuals = JSON.parse(fs.readFileSync(manualsFile, 'utf-8'));
  }
  
  // Check if we already have this manual/guide
  const existingIndex = manuals.findIndex(manual => 
    manual.id === data.id || 
    (manual.title === data.title && manual.model === data.model)
  );
  
  if (existingIndex >= 0) {
    // Update existing manual
    manuals[existingIndex] = {
      ...manuals[existingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new manual
    manuals.push({
      ...data,
      type,
      createdAt: new Date().toISOString()
    });
  }
  
  // Save back to file
  fs.writeFileSync(manualsFile, JSON.stringify(manuals, null, 2));
}

/**
 * Store document in history
 * @param {string} type - Document type
 * @param {string} category - Document category
 * @param {object} data - Document data
 * @returns {Promise<void>}
 */
async function storeInHistory(type, category, data) {
  const historyFile = path.join(process.cwd(), 'data', 'history.json');
  
  let history = [];
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  }
  
  // Add to history
  history.push({
    id: data.id || uuidv4(),
    type,
    title: data.title,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toISOString().split('T')[1].substring(0, 5),
    tags: [category, type, ...buildTagsFromData(data)],
    preview: buildPreviewFromData(data, type),
    favorite: false
  });
  
  // Keep only the latest 100 items
  history = history.slice(-100);
  
  // Save back to file
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

/**
 * Build tags from document data
 * @param {object} data - Document data
 * @returns {string[]} - Tags
 */
function buildTagsFromData(data) {
  const tags = [];
  
  if (data.year) {
    tags.push(data.year);
  }
  
  if (data.model) {
    tags.push(data.model.toLowerCase());
  }
  
  return tags;
}

/**
 * Build preview content based on document type and data
 * @param {object} data - Document data
 * @param {string} type - Document type
 * @returns {string|object} - Preview content
 */
function buildPreviewFromData(data, type) {
  if (type === DOCUMENT_TYPES.SPECIFICATION) {
    // For specifications, return a formatted summary
    return `Technical specifications for ${data.model || 'Cadillac EV'} including performance metrics, battery information, and dimensions.`;
  }
  
  if (data.textContent) {
    return data.textContent;
  }
  
  return `${type.charAt(0).toUpperCase() + type.slice(1)} document for ${data.model || 'Cadillac'}`;
} 