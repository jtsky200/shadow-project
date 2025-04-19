/**
 * In-memory storage for PDF sessions
 * 
 * This module provides shared storage for PDF session data
 * that can be accessed across different API routes.
 */

// Define the PDF session data interface
export interface PdfSession {
  text: string;
  embedding: number[];
  fileName: string;
  uploadDate: string;
}

// Create a Map to store PDF session data
const sessionStorage = new Map<string, PdfSession>();

export default sessionStorage; 