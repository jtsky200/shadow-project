# Shadow AI Backend

This is a simplified backend server for the Shadow AI application. It provides the following endpoints:

- `GET /`: Health check endpoint
- `POST /ask-memory`: Main chat endpoint that processes questions and returns answers

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001
   ```

## Running the server

Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
``` 