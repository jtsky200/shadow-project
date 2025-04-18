// Simplified backend server for deployment
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Shadow AI Backend is running' });
});

// Main chat endpoint
app.post('/ask-memory', async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Get a response from the model
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful Cadillac vehicle assistant providing information about Cadillac vehicles, features, and troubleshooting.' },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
    });
    
    const answer = completion.choices[0].message.content;
    
    return res.json({ 
      answer,
      sessionId
    });
  } catch (error) {
    console.error('Error in /ask-memory:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
}); 