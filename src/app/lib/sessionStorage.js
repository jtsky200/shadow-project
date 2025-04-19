/**
 * In-memory storage for PDF sessions
 * 
 * This module provides shared storage for PDF session data
 * that can be accessed across different API routes.
 */

// Create a Map to store PDF session data
const sessionStorage = new Map();

export default sessionStorage; 