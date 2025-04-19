/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';

const app = next({
  dev: isDev,
  conf: { distDir: '.next' },
});

const handle = app.getRequestHandler();

// Erhöht das Timeout auf 300 Sekunden und den Speicher auf 1GB für bessere Performance
exports.nextApp = onRequest({
  timeoutSeconds: 300,
  memory: '1GiB',
  minInstances: 0,
}, (req, res) => {
  return app.prepare().then(() => handle(req, res));
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
