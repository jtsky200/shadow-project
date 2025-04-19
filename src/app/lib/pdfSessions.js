/**
 * Shared PDF session storage
 * 
 * This module provides a simple in-memory store for PDF sessions
 * that can be accessed across different API routes.
 * 
 * In a production environment, this would be replaced with
 * a database, Redis, or other persistent storage solution.
 */

// A Map to store PDF session data with their IDs as keys
const pdfSessions = new Map();

/**
 * Store a PDF session
 * @param {string} sessionId - Unique session identifier
 * @param {object} sessionData - PDF session data
 */
export function storePdfSession(sessionId, sessionData) {
  pdfSessions.set(sessionId, {
    ...sessionData,
    createdAt: new Date()
  });
  return sessionId;
}

/**
 * Get a PDF session by ID
 * @param {string} sessionId - Session ID to retrieve
 * @returns {object|null} - The session data or null if not found
 */
export function getPdfSession(sessionId) {
  return pdfSessions.has(sessionId) ? pdfSessions.get(sessionId) : null;
}

/**
 * Check if a PDF session exists
 * @param {string} sessionId - Session ID to check
 * @returns {boolean} - True if session exists
 */
export function hasPdfSession(sessionId) {
  return pdfSessions.has(sessionId);
}

/**
 * Get all PDF sessions
 * @returns {Map} - All PDF sessions
 */
export function getAllPdfSessions() {
  return pdfSessions;
}

/**
 * Delete a PDF session
 * @param {string} sessionId - Session ID to delete
 * @returns {boolean} - True if session was deleted
 */
export function deletePdfSession(sessionId) {
  return pdfSessions.delete(sessionId);
}

/**
 * Clear all PDF sessions
 */
export function clearAllPdfSessions() {
  pdfSessions.clear();
}

const pdfSessionService = {
  store: storePdfSession,
  get: getPdfSession,
  has: hasPdfSession,
  getAll: getAllPdfSessions,
  delete: deletePdfSession,
  clear: clearAllPdfSessions
};

export { pdfSessionService };
export default pdfSessionService; 