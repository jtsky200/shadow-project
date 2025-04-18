# Cadillac Assistant

A sophisticated AI assistant for Cadillac vehicle information with real-time API integrations.

## Features

- Interactive chat interface for vehicle manual queries
- PDF document support for uploading and analyzing manuals
- Streaming responses with typing indicators
- Real-time API integration for:
  - Weather data for major European cities
  - EV charging station status 
- Tool-calling capabilities for:
  - Vehicle specifications
  - Warranty information
  - Maintenance schedules
  - Charging port information
  - Model comparisons

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher (for streaming features)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your API keys:
   - `DEEPSEEK_API_KEY` - Required for main chat functionality
   - `OPENAI_API_KEY` - Used as fallback for embeddings and chat
   - `OPENCHARGE_API_KEY` - For charging station data (optional, will use demo key if not provided)

### Running the Project

Start both the Next.js app and the backend server with:

```bash
npm run dev:all
```

Or start them separately:

```bash
# Start Next.js app
npm run dev:frontend

# Start backend server
npm run dev:backend
```

## Real-Time API Features

The assistant can access external APIs to provide real-time information during conversations:

### Weather Information

Ask about weather in major European cities:
- "What's the weather like in Berlin?"
- "Is it raining in Paris right now?"
- "Tell me about the weather conditions in London"
- "How's the weather in Zurich today?"

Supported cities include: Berlin, Paris, London, Rome, Madrid, Vienna, Amsterdam, Brussels, Munich, Frankfurt, Zurich, Geneva, Bern, Basel, and Lausanne.

### Charging Station Status

Check the status of EV charging stations by ID:
- "Is charging station 12345 available?"
- "Check the status of charging point 67890"
- "What types of plugs does station 54321 have?"

## Architecture

This project uses a dual-server architecture:

1. **Next.js App**: Handles the UI and client-side functionality
2. **Express Backend**: Manages API calls, tool functions, and streaming capabilities

## Environment Variables

All API keys and sensitive information are stored in environment variables. See `.env.example` for required variables.

## Caching

The real-time API features implement a caching mechanism to reduce API usage:
- Responses are cached for 15 minutes by default
- Error responses are not cached to allow retry
- Cache is stored in memory and resets when the server restarts

## DeepSeek Integration

This project includes two modes of interaction with the DeepSeek model:

### Streaming Mode
- Simulated streaming responses via a Python script
- Real-time typing effect for a more natural conversation experience
- Express.js server to handle the streaming communication

### Memory Mode
- Maintains conversation history for contextual multi-turn conversations
- Allows follow-up questions that reference previous exchanges
- Includes relevant manual content with each request
- Makes calls to the DeepSeek API with complete conversation context

## Deployment

### Vercel Deployment

This application can be deployed to Vercel with the following steps:

1. Ensure you have the Vercel CLI installed:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Link your local project to a Vercel project:
   ```bash
   vercel link
   ```

4. Deploy using the unified script:
   ```bash
   node vercel-deploy.js
   ```

### Environment Variables for Vercel

Before deploying, ensure these environment variables are set in your Vercel project:

- `DEEPSEEK_API_KEY`: Your DeepSeek API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Your Firebase admin SDK service account (JSON content)

### Firebase Configuration

The application uses Firebase for storage and authentication. For local development:

1. Place your Firebase Admin SDK service account JSON file in the `config/` directory
2. Set up the necessary environment variables in your `.env` file

## Documentation

Additional documentation can be found in the `docs/` directory, covering topics such as:
- Firebase storage setup
- PDF document processing
- API integrations
- Deployment guides
