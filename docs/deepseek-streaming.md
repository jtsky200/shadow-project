# DeepSeek Integration

This document explains how the DeepSeek features are integrated into the Shadow AI application.

## Overview

The system provides two modes of interaction with the DeepSeek model:

1. **Streaming Mode**: Uses a Python script to simulate streaming responses, providing real-time typing effects
2. **Memory Mode**: Maintains conversation history for more contextual multi-turn conversations

## Components

### Streaming Components

1. **Python Script** (`scripts/deepseek_stream.py`):
   - Simulates streaming responses from the DeepSeek model
   - Contains information about Cadillac LYRIQ and OPTIQ models
   - Streams responses word by word with a simulated delay

2. **Express Server** (`server.js`):
   - Handles HTTP requests from the frontend
   - Spawns the Python script as a child process for streaming
   - Maintains chat sessions for memory-based interactions
   - Provides endpoints for both streaming and memory-based chat

3. **React Component** (`src/components/ManualChat.jsx`):
   - Implements a chat interface for users
   - Allows toggling between streaming and memory modes
   - Displays streamed responses with a typing animation
   - Preserves conversation history in memory mode

### Memory-Based Components

1. **Chat Sessions** (server-side):
   - Stores conversation history for each user session
   - Includes system prompt and all user/assistant exchanges
   - Maintains context for follow-up questions

2. **DeepSeek API Integration**:
   - Makes calls to the DeepSeek API with the full conversation history
   - Includes relevant manual content in each request
   - Uses a lower temperature setting for more focused responses

## Running the System

To start both the Next.js application and the streaming server:

```bash
npm run dev:all
```

Or start them separately:

```bash
# Start Next.js app
npm run dev

# Start streaming server
npm run server
```

## API Endpoints

- **POST /ask-stream**: Accepts a JSON object with a `question` field and streams back the response
- **POST /ask-memory**: Accepts a JSON object with `question` and optional `sessionId` fields, returning a complete response after maintaining conversation history

## Memory Mode Features

When using memory mode:
- The system remembers previous interactions within the same session
- Follow-up questions can refer to previous questions and answers
- The context from the manual is included with each request
- The chat maintains continuity across multiple turns

## Car Information

The system provides information about:

- Range capabilities
- Battery specifications
- Power output
- Charging capabilities
- Safety features
- Awards and recognition

## Future Improvements

For a production environment:
- The streaming simulation would be replaced with actual integration to the DeepSeek streaming API
- Memory persistence could be implemented with a database for longer-term storage
- User authentication could be added to maintain personal conversation histories 