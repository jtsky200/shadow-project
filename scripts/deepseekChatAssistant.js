import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const manual = JSON.parse(fs.readFileSync('./public/assets/manual/manual-content.json', 'utf-8'));
const apiKey = process.env.DEEPSEEK_API_KEY;

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
};

const getQueryEmbedding = async (query) => {
  const response = await axios.post(
    'https://api.deepseek.com/v1/embeddings',
    {
      model: 'deepseek-embedding',
      input: query,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data[0].embedding;
};

const askDeepSeek = async (question, context) => {
  const response = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant helping users understand a Cadillac manual. Answer clearly and concisely using the provided content.',
        },
        {
          role: 'user',
          content: `Here is the relevant manual content:\n${context}\n\nUser question: ${question}`,
        },
      ],
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
};

const runAssistant = async () => {
  const question = process.argv.slice(2).join(' ');
  if (!question) {
    console.error('❗ Please provide a question as a command-line argument.');
    return;
  }

  console.log('🔍 Embedding user question...');
  const queryEmbedding = await getQueryEmbedding(question);

  const topMatches = manual
    .filter(entry => entry.embedding)
    .map(entry => ({
      ...entry,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const contextText = topMatches.map(m => m.ocrText || m.rawText).join('\n---\n');

  console.log('🤖 Asking DeepSeek...');
  const answer = await askDeepSeek(question, contextText);
  console.log('\n🧠 DeepSeek Response:\n');
  console.log(answer);
};

runAssistant(); 