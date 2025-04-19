import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint to retrieve specifications from the data store
 * GET /api/specifications
 */
export async function GET() {
  try {
    const specsFile = path.join(process.cwd(), 'data', 'specifications.json');
    
    // Check if the specifications file exists
    if (fs.existsSync(specsFile)) {
      // Read specifications from the data store
      const specificationsData = JSON.parse(fs.readFileSync(specsFile, 'utf-8'));
      
      return NextResponse.json({
        success: true,
        specifications: specificationsData
      });
    } else {
      // If the file doesn't exist, return an empty array
      return NextResponse.json({
        success: true,
        specifications: []
      });
    }
  } catch (error) {
    console.error('Error retrieving specifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve specifications'
    }, { status: 500 });
  }
}

/**
 * API endpoint to add or update a specification
 * POST /api/specifications
 */
export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data || !data.id || !data.model || !data.specifications) {
      return NextResponse.json({
        success: false,
        error: 'Invalid specification data'
      }, { status: 400 });
    }
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const specsFile = path.join(dataDir, 'specifications.json');
    
    // Read existing specifications
    let specs = [];
    if (fs.existsSync(specsFile)) {
      specs = JSON.parse(fs.readFileSync(specsFile, 'utf-8'));
    }
    
    // Check if we're updating an existing specification
    const existingIndex = specs.findIndex(spec => spec.id === data.id);
    
    if (existingIndex >= 0) {
      // Update existing specification
      specs[existingIndex] = {
        ...specs[existingIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new specification
      specs.push({
        ...data,
        createdAt: new Date().toISOString()
      });
    }
    
    // Save back to file
    fs.writeFileSync(specsFile, JSON.stringify(specs, null, 2));
    
    return NextResponse.json({
      success: true,
      message: existingIndex >= 0 ? 'Specification updated' : 'Specification added',
      specification: existingIndex >= 0 ? specs[existingIndex] : specs[specs.length - 1]
    });
    
  } catch (error) {
    console.error('Error saving specification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save specification'
    }, { status: 500 });
  }
} 