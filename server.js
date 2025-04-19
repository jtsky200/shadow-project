import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import admin from 'firebase-admin';
import fileUpload from 'express-fileupload';
import pdfParse from 'pdf-parse';

dotenv.config();

// Initialize Firebase Admin
let db;
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  db = admin.firestore();
} catch (error) {
  console.warn('Firebase initialization error:', error.message);
  console.warn('Continuing without Firebase, chat history will not be persisted');
  // Create a mock db object when Firebase isn't available
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async () => ({})
      })
    })
  };
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

// Sessions for PDF storage
const pdfSessions = new Map();

// Simple cache for API responses to reduce usage
const apiCache = {
  weather: new Map(), // city -> {data, timestamp}
  charging: new Map() // stationId -> {data, timestamp}
};

// Cache TTL in milliseconds (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

// Helper to check if cache entry is still valid
const isCacheValid = (entry) => {
  if (!entry) return false;
  return (Date.now() - entry.timestamp) < CACHE_TTL;
};

// Cosine similarity for document retrieval
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
};

// Define functions that can be called by DeepSeek
const functions = {
  getVehicleSpecSheet: ({ model }) => {
    const name = model.toUpperCase();
    return `📄 Specs for ${name}:
- Battery: 400V
- AWD, 500km WLTP
- 10–80% in 30 min
- 33" OLED Display
- Level 2 Super Cruise`;
  },

  compareSpecs: ({ modelA, modelB }) => {
    const A = functions.getVehicleSpecSheet({ model: modelA });
    const B = functions.getVehicleSpecSheet({ model: modelB });
    return `📊 Comparing ${modelA.toUpperCase()} vs ${modelB.toUpperCase()}:\n\n${A}\n\n---\n\n${B}`;
  },

  lookupWarrantyByVIN: ({ vin }) => {
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `🔍 Warranty lookup for VIN ${cleanVin}:
- Bumper-to-Bumper: 4 years / 80,000 km
- Powertrain: 6 years / 110,000 km
- EV Components: 8 years / 160,000 km`;
  },

  checkChargingPortType: ({ region }) => {
    const type = region.toLowerCase().includes('eu') ? 'CCS2' : 'SAE J1772 + CCS1';
    return `🔌 Charging port type for ${region.toUpperCase()}: ${type}`;
  },

  summarizeMaintenanceSchedule: ({ model, kilometers }) => {
    const km = parseInt(kilometers, 10);
    if (km < 15000) {
      return `🛠️ ${model}: First check at 15,000 km — inspect brakes, fluids, tire wear.`;
    } else if (km < 30000) {
      return `🛠️ ${model}: 30,000 km service — replace cabin filter, rotate tires, battery check.`;
    } else {
      return `🛠️ ${model}: Comprehensive 45,000 km service — full diagnostics, brake flush, software updates.`;
    }
  },

  listAvailableModels: () => {
    return `🚗 Available Cadillac EU Models:
- LYRIQ (EV SUV)
- OPTIQ (compact EV)
- CT5-V Blackwing (performance sedan)
- ESCALADE IQ (upcoming full-size EV)`;
  },
  
  // New real-time API functions
  getChargingStatus: async ({ stationId }) => {
    try {
      // Check cache first
      const cachedData = apiCache.charging.get(stationId);
      if (isCacheValid(cachedData)) {
        console.log(`Using cached charging data for station ${stationId}`);
        return cachedData.data;
      }
      
      // Get API key from environment variables, fallback to demo key
      const apiKey = process.env.OPENCHARGE_API_KEY || 'demo';
      
      const url = `https://api.openchargemap.io/v3/poi/?output=json&chargepointid=${stationId}&key=${apiKey}`;
      const res = await axios.get(url, { timeout: 5000 }); // 5s timeout
      
      if (!res.data || res.data.length === 0) {
        const notFoundMessage = `⚡ Station ID ${stationId} not found in the database.`;
        // Cache the not found response to avoid repeated calls
        apiCache.charging.set(stationId, { 
          data: notFoundMessage, 
          timestamp: Date.now() 
        });
        return notFoundMessage;
      }
      
      const station = res.data[0];
      const stationInfo = `⚡ Charging Station "${station.AddressInfo.Title}":
- Address: ${station.AddressInfo.AddressLine1}, ${station.AddressInfo.Town || ''}
- Status: ${station.StatusType?.Title || 'Unknown'}
- Plugs: ${station.Connections?.map(c => c.ConnectionType.Title).join(', ') || 'Unknown'}
- Last Updated: ${new Date().toLocaleString()}`;
      
      // Cache the response
      apiCache.charging.set(stationId, { 
        data: stationInfo, 
        timestamp: Date.now() 
      });
      
      return stationInfo;
    } catch (error) {
      console.error('Error fetching charging station:', error.message);
      // Don't cache errors to allow retry
      return `⚡ Unable to retrieve charging station information. Please try again later. (Error: ${error.message.substring(0, 50)}...)`;
    }
  },

  getWeatherAtLocation: async ({ city }) => {
    try {
      // Normalize city name for cache lookup
      const normalizedCity = city.trim().toLowerCase();
      
      // Check cache first
      const cachedData = apiCache.weather.get(normalizedCity);
      if (isCacheValid(cachedData)) {
        console.log(`Using cached weather data for ${city}`);
        return cachedData.data;
      }
      
      // Get coordinates for city (using fixed coordinates for demo)
      // In a production app, this would use a geocoding service
      const coordinates = { 
        berlin: { lat: 52.52, lon: 13.41 },
        paris: { lat: 48.85, lon: 2.35 },
        london: { lat: 51.51, lon: -0.13 },
        rome: { lat: 41.89, lon: 12.48 },
        madrid: { lat: 40.42, lon: -3.70 },
        vienna: { lat: 48.21, lon: 16.37 },
        amsterdam: { lat: 52.37, lon: 4.89 },
        brussels: { lat: 50.85, lon: 4.35 },
        munich: { lat: 48.14, lon: 11.58 },
        frankfurt: { lat: 50.11, lon: 8.68 },
        zurich: { lat: 47.37, lon: 8.54 },
        geneva: { lat: 46.21, lon: 6.14 },
        bern: { lat: 46.95, lon: 7.45 },
        basel: { lat: 47.56, lon: 7.59 },
        lausanne: { lat: 46.52, lon: 6.63 }
      };
      
      // Get lat/lon or use Zurich as default (company is based in Switzerland)
      const location = coordinates[normalizedCity] || coordinates.zurich;
      const displayCity = coordinates[normalizedCity] ? city : `${city} (using Zurich as fallback)`;
      
      // Using Open-Meteo API which doesn't require authentication
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
      const res = await axios.get(url, { timeout: 5000 }); // 5s timeout
      
      if (!res.data || !res.data.current) {
        throw new Error('Invalid response from weather API');
      }
      
      const current = res.data.current;
      
      // Map weather code to condition
      const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
      };
      
      const condition = weatherCodes[current.weather_code] || `Unknown (code: ${current.weather_code})`;
      
      const weatherInfo = `🌤️ Weather in ${displayCity}:
- Temperature: ${current.temperature_2m}°C
- Windspeed: ${current.wind_speed_10m} km/h
- Humidity: ${current.relative_humidity_2m}%
- Condition: ${condition}
- Last updated: ${new Date(current.time).toLocaleString()}`;
      
      // Cache the response
      apiCache.weather.set(normalizedCity, { 
        data: weatherInfo, 
        timestamp: Date.now() 
      });
      
      return weatherInfo;
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      // Don't cache errors to allow retry
      return `🌤️ Unable to retrieve weather information for ${city}. Please try again later. (Error: ${error.message.substring(0, 50)}...)`;
    }
  },
};

// Define function schemas for DeepSeek
const functionDefs = [
  {
    name: 'getVehicleSpecSheet',
    description: 'Get official specs for a Cadillac model',
    parameters: {
      type: 'object',
      properties: {
        model: { type: 'string', description: 'Model name, e.g. LYRIQ' },
      },
      required: ['model'],
    },
  },
  {
    name: 'compareSpecs',
    description: 'Compare two Cadillac models',
    parameters: {
      type: 'object',
      properties: {
        modelA: { type: 'string' },
        modelB: { type: 'string' },
      },
      required: ['modelA', 'modelB'],
    },
  },
  {
    name: 'lookupWarrantyByVIN',
    description: 'Returns estimated warranty info based on VIN',
    parameters: {
      type: 'object',
      properties: {
        vin: { type: 'string', description: '17-character vehicle VIN code' },
      },
      required: ['vin'],
    },
  },
  {
    name: 'checkChargingPortType',
    description: 'Returns connector standard for a region',
    parameters: {
      type: 'object',
      properties: {
        region: { type: 'string', description: 'Region or market, e.g. EU, US, Asia' },
      },
      required: ['region'],
    },
  },
  {
    name: 'summarizeMaintenanceSchedule',
    description: 'Returns recommended maintenance based on kilometers',
    parameters: {
      type: 'object',
      properties: {
        model: { type: 'string', description: 'Cadillac model' },
        kilometers: { type: 'string', description: 'Current km mileage' },
      },
      required: ['model', 'kilometers'],
    },
  },
  {
    name: 'listAvailableModels',
    description: 'Lists available Cadillac models in EU',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  // New real-time API function definitions
  {
    name: 'getChargingStatus',
    description: 'Check real-time charging status of a station',
    parameters: {
      type: 'object',
      properties: {
        stationId: { type: 'string', description: 'OpenChargeMap station ID' },
      },
      required: ['stationId'],
    },
  },
  {
    name: 'getWeatherAtLocation',
    description: 'Check real-time weather in a city',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name (e.g., Berlin, Paris, London, Rome)' },
      },
      required: ['city'],
    },
  },
];

// Endpoint to handle PDF uploads
app.post('/upload-pdf', async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).json({ error: 'No PDF uploaded' });
  }

  try {
    const dataBuffer = req.files.pdf.data;
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text.slice(0, 8000); // Limit text size

    // Generate embedding
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    // Create a session ID
    const sessionId = Date.now().toString();
    
    // Store PDF data in memory
    pdfSessions.set(sessionId, {
      text,
      embedding: embeddingRes.data[0].embedding,
      fileName: req.files.pdf.name,
      uploadDate: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      sessionId,
      fileName: req.files.pdf.name,
      contentPreview: text.slice(0, 300) + '...' 
    });
  } catch (err) {
    console.error('PDF processing error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Document retrieval endpoint
app.post('/retrieve-doc', async (req, res) => {
  const { query, sessionId, threshold = 0.6 } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  try {
    // Generate query embedding
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    
    const queryEmbedding = embeddingRes.data[0].embedding;
    
    // Check for PDF session first
    if (sessionId && pdfSessions.has(sessionId)) {
      const pdfData = pdfSessions.get(sessionId);
      
      // If we have an embedding, check similarity
      if (pdfData.embedding) {
        const similarity = cosineSimilarity(queryEmbedding, pdfData.embedding);
        
        if (similarity > threshold) {
          return res.json({
            context: pdfData.text,
            source: 'uploaded-pdf',
            fileName: pdfData.fileName
          });
        }
      } else {
        // If no embedding, just return the PDF content
        return res.json({
          context: pdfData.text,
          source: 'uploaded-pdf',
          fileName: pdfData.fileName
        });
      }
    }
    
    // Check for manual embeddings
    let embedded = [];
    try {
      const embedJSON = fs.readFileSync('./manual-embeddings.json', 'utf-8');
      embedded = JSON.parse(embedJSON);
    } catch (error) {
      console.warn('Could not load manual-embeddings.json:', error.message);
      
      // Try to use manual-content.json as fallback
      try {
        const manualJSON = fs.readFileSync('./manual-content.json', 'utf-8');
        const manual = JSON.parse(manualJSON);
        
        if (manual && manual.length > 0) {
          const chunks = manual
            .filter(page => page.ocrText)
            .slice(0, 3)
            .map(page => page.ocrText);
            
          return res.json({
            context: chunks.join('\n\n---\n\n'),
            source: 'manual-content-fallback'
          });
        }
      } catch (manualError) {
        console.error('Could not load manual-content.json:', manualError.message);
        return res.json({
          context: 'No relevant documents found.',
          source: 'none'
        });
      }
    }
    
    // Find the most relevant chunks
    const results = embedded
      .map(e => ({
        ...e,
        similarity: cosineSimilarity(queryEmbedding, e.embedding)
      }))
      .filter(e => e.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
      
    if (results.length === 0) {
      return res.json({
        context: 'No relevant content found in the manual.',
        source: 'none'
      });
    }
    
    // Format results
    const context = results
      .map(r => `Page ${r.page || 'N/A'}:\n${r.text}`)
      .join('\n\n---\n\n');
      
    return res.json({
      context,
      source: 'manual-embeddings',
      matches: results.length
    });
    
  } catch (error) {
    console.error('Document retrieval error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint to handle streaming responses
app.post('/ask-stream', (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Spawn Python process
  const python = spawn('python', ['scripts/deepseek_stream.py']);
  
  // Send the question to the Python script
  python.stdin.write(question);
  python.stdin.end();

  // Stream output from Python script to client
  python.stdout.on('data', (data) => {
    res.write(data);
  });

  // Handle any errors
  python.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  // End the response when the Python script finishes
  python.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    res.end();
  });
});

// Endpoint for memory-based chat with tool calling and OpenAI fallback
app.post('/ask-memory', async (req, res) => {
  const { question, sessionId = 'default', pdfSessionId } = req.body;
  
  try {
    // Get existing conversation from Firestore or memory
    const doc = db.collection('cadillac-chat').doc(sessionId);
    const snapshot = await doc.get();
    let messages = snapshot.exists ? snapshot.data().messages : [];

    // If no previous messages, initialize with system prompt
    if (!messages.length) {
      messages = [{
        role: 'system',
        content: 'You are a Cadillac assistant. You can access real-time information like weather and charging station status. Use tools to provide accurate and up-to-date information to users.',
      }];
    }

    // Retrieve relevant document context
    let documentContext = '';
    try {
      // First check if we have a PDF session
      if (pdfSessionId && pdfSessions.has(pdfSessionId)) {
        documentContext = pdfSessions.get(pdfSessionId).text;
      } else {
        // Otherwise retrieve from semantic search
        const contextRes = await axios.post('http://localhost:3001/retrieve-doc', {
          query: question,
          sessionId: pdfSessionId
        });
        
        if (contextRes.data && contextRes.data.context) {
          documentContext = contextRes.data.context;
        }
      }
    } catch (contextError) {
      console.warn('Failed to retrieve document context:', contextError.message);
      
      // Fallback to manual-content.json
      try {
        const context = fs.readFileSync('./manual-content.json', 'utf-8');
        const pages = JSON.parse(context)
          .filter(p => p.ocrText)
          .map(p => p.ocrText)
          .slice(0, 5)
          .join('\n---\n');
        documentContext = pages;
      } catch (manualError) {
        console.warn('Could not read manual-content.json:', manualError.message);
      }
    }

    // Add user question with context to messages
    messages.push({ 
      role: 'user', 
      content: documentContext 
        ? `Document context:\n${documentContext}\n\nUser question: ${question}`
        : question
    });

    try {
      // Try using DeepSeek API first
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages,
          functions: functionDefs,
          function_call: 'auto',
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const choice = response.data.choices[0];

      // If the model decides to call a function
      if (choice.finish_reason === 'function_call') {
        const fn = choice.message.function_call;
        const args = JSON.parse(fn.arguments);
        
        console.log(`Executing function: ${fn.name} with args:`, args);
        
        try {
          // Handle both async and synchronous functions
          const output = await Promise.resolve(functions[fn.name]?.(args) || '❌ Function not available.');
          
          console.log(`Function ${fn.name} returned:`, output.substring(0, 100) + (output.length > 100 ? '...' : ''));
          
          messages.push({ role: 'function', name: fn.name, content: output });
          messages.push({ role: 'user', content: 'Now explain that info to me.' });
          
          // Get a follow-up explanation after the function call
          const followUp = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
              model: 'deepseek-chat',
              messages,
              temperature: 0.3,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const reply = followUp.data.choices[0].message.content;
          messages.push({ role: 'assistant', content: reply });
          
          // Save conversation to Firestore
          await doc.set({ messages });
          return res.json({ answer: reply });
        } catch (functionError) {
          console.error(`Error executing function ${fn.name}:`, functionError);
          const errorMsg = `I tried to get real-time information for you, but encountered an error: ${functionError.message}. Let me answer based on what I know.`;
          messages.push({ role: 'function', name: fn.name, content: errorMsg });
          
          // Continue with standard response
          const followUpAfterError = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            {
              model: 'deepseek-chat',
              messages,
              temperature: 0.3,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const errorReply = followUpAfterError.data.choices[0].message.content;
          messages.push({ role: 'assistant', content: errorReply });
          
          // Save conversation to Firestore
          await doc.set({ messages });
          return res.json({ answer: errorReply });
        }
      }

      // Standard text response
      const final = choice.message.content;
      messages.push({ role: 'assistant', content: final });
      
      // Save conversation to Firestore
      await doc.set({ messages });
      return res.json({ answer: final });

    } catch (deepseekErr) {
      // If DeepSeek fails, fall back to OpenAI
      console.warn('DeepSeek failed, using OpenAI fallback...', deepseekErr.message);

      try {
        // Clean up messages for OpenAI (remove document context)
        const cleanMessages = messages.map(msg => {
          if (msg.role === 'user' && msg.content.includes('Document context:')) {
            return {
              ...msg,
              content: msg.content.replace(/Document context:[\s\S]*?User question: /g, '')
            };
          }
          return msg;
        });

        const fallback = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: cleanMessages,
          temperature: 0.4,
        });

        const fallbackReply = fallback.choices[0].message.content;
        messages.push({ role: 'assistant', content: fallbackReply });
        
        // Save conversation to Firestore
        await doc.set({ messages });
        return res.json({ answer: fallbackReply });
      } catch (openaiErr) {
        console.error('OpenAI fallback also failed:', openaiErr.message);
        return res.status(500).json({ 
          answer: '❌ Sorry, I encountered an error while processing your request. Please try again later.' 
        });
      }
    }
  } catch (error) {
    console.error('Error in /ask-memory:', error.message);
    return res.status(500).json({ 
      answer: '❌ Sorry, there was a problem with the chat service. Please try again later.' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 