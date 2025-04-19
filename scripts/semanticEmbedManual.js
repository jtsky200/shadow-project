import dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const manualPath = './public/assets/manual/manual-content.json';
const outputPath = './public/assets/manual/manual-content.json';

const tagContent = async (text) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an assistant that classifies vehicle manual content." },
      {
        role: "user",
        content: `Classify this into 1–3 of the following tags: ["charging", "infotainment", "safety", "maintenance", "comfort", "driving"]\n\nContent:\n${text}`
      }
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content
    .replace(/[^\w,\s]/g, '')
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
};

const getEmbedding = async (text) => {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
};

(async () => {
  const data = JSON.parse(fs.readFileSync(manualPath, 'utf-8'));

  for (const entry of data) {
    const fullText = `${entry.ocrText || ''}\n${entry.rawText || ''}`.slice(0, 8000);
    console.log(`🧠 Processing page ${entry.page}...`);

    try {
      entry.embedding = await getEmbedding(fullText);
      entry.tags = await tagContent(fullText);
    } catch (err) {
      console.error(`❌ Error on page ${entry.page}:`, err.message);
    }

    await new Promise(res => setTimeout(res, 1000)); // basic rate limit buffer
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Updated manual saved to ${outputPath}`);
})(); 