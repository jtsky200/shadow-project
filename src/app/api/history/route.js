import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint to retrieve history entries
 * GET /api/history
 */
export async function GET() {
  try {
    const historyFile = path.join(process.cwd(), 'data', 'history.json');
    
    // Check if the history file exists
    if (fs.existsSync(historyFile)) {
      // Read history from the data store
      const historyData = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
      
      return NextResponse.json({
        success: true,
        history: historyData
      });
    } else {
      // If the file doesn't exist, return an empty array
      return NextResponse.json({
        success: true,
        history: []
      });
    }
  } catch (error) {
    console.error('Error retrieving history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve history'
    }, { status: 500 });
  }
}

/**
 * API endpoint to add a history entry
 * POST /api/history
 */
export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data || !data.type || !data.title) {
      return NextResponse.json({
        success: false,
        error: 'Invalid history data'
      }, { status: 400 });
    }
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const historyFile = path.join(dataDir, 'history.json');
    
    // Read existing history
    let history = [];
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    }
    
    // Create the new history entry
    const newEntry = {
      id: data.id || uuidv4(),
      type: data.type,
      title: data.title,
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toISOString().split('T')[1].substring(0, 5),
      tags: data.tags || [],
      preview: data.preview || '',
      favorite: data.favorite || false
    };
    
    // Add to history, keeping most recent at the beginning
    history.unshift(newEntry);
    
    // Keep only the latest 100 items
    history = history.slice(0, 100);
    
    // Save back to file
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'History entry added',
      entry: newEntry
    });
    
  } catch (error) {
    console.error('Error saving history entry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save history entry'
    }, { status: 500 });
  }
}

/**
 * API endpoint to update a history entry
 * PUT /api/history
 */
export async function PUT(request) {
  try {
    const data = await request.json();
    
    if (!data || !data.id) {
      return NextResponse.json({
        success: false,
        error: 'Invalid history data'
      }, { status: 400 });
    }
    
    const historyFile = path.join(process.cwd(), 'data', 'history.json');
    
    // Check if the history file exists
    if (!fs.existsSync(historyFile)) {
      return NextResponse.json({
        success: false,
        error: 'History file not found'
      }, { status: 404 });
    }
    
    // Read existing history
    let history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    
    // Find the entry to update
    const entryIndex = history.findIndex(entry => entry.id === data.id);
    
    if (entryIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'History entry not found'
      }, { status: 404 });
    }
    
    // Update the entry
    history[entryIndex] = {
      ...history[entryIndex],
      ...data
    };
    
    // Save back to file
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'History entry updated',
      entry: history[entryIndex]
    });
    
  } catch (error) {
    console.error('Error updating history entry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update history entry'
    }, { status: 500 });
  }
}

/**
 * API endpoint to delete a history entry
 * DELETE /api/history
 */
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Invalid history entry ID'
      }, { status: 400 });
    }
    
    const historyFile = path.join(process.cwd(), 'data', 'history.json');
    
    // Check if the history file exists
    if (!fs.existsSync(historyFile)) {
      return NextResponse.json({
        success: false,
        error: 'History file not found'
      }, { status: 404 });
    }
    
    // Read existing history
    let history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    
    // Filter out the entry to delete
    const newHistory = history.filter(entry => entry.id !== id);
    
    // If length is the same, the entry was not found
    if (newHistory.length === history.length) {
      return NextResponse.json({
        success: false,
        error: 'History entry not found'
      }, { status: 404 });
    }
    
    // Save back to file
    fs.writeFileSync(historyFile, JSON.stringify(newHistory, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'History entry deleted'
    });
    
  } catch (error) {
    console.error('Error deleting history entry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete history entry'
    }, { status: 500 });
  }
} 