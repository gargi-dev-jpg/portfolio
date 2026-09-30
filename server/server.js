import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { portfolioData } from '../src/data.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const databasePath = join(dirname(fileURLToPath(import.meta.url)), 'db.json');
let memoryDatabase = null;
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const assistantProfile = {
  name: portfolioData.name,
  role: portfolioData.role,
  location: portfolioData.location,
  bio: portfolioData.bio,
  skills: [
    ...portfolioData.skills.languages,
    ...portfolioData.skills.web,
    ...portfolioData.skills.core,
    ...portfolioData.skills.tools,
  ],
  codingProfiles: portfolioData.socials.map(({ name, url }) => ({ name, url })),
  education: portfolioData.education,
  workExperience: portfolioData.workExperience,
  hackathons: portfolioData.hackathons,
  academicAchievement: portfolioData.academicAchievement,
  certifications: portfolioData.certifications,
  spokenLanguages: portfolioData.spokenLanguages,
  projects: portfolioData.projects.map(({ title, tags, description }) => ({ title, tags, description })),
};

const assistantInstructions = `You are a friendly assistant representing ${portfolioData.name}'s portfolio. Answer warmly and concisely in 2 to 3 sentences. Only state facts included in this profile; never invent or infer details. If asked something outside the profile, say you can only answer questions about this portfolio. IMPORTANT: You must seamlessly understand queries in English, Hindi (Devanagari), and Hinglish (conversational Hindi written in the English alphabet). Reply in the exact same language and style the user used (e.g., respond in natural Hinglish if asked in Hinglish).\n\nProfile: ${JSON.stringify(assistantProfile)}`;
const chatModels = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

function getGeminiErrorStatus(error) {
  const status = Number(error.status ?? error.code ?? error.error?.code);
  if (Number.isInteger(status)) return status;

  const serializedStatus = String(error.message).match(/"code"\s*:\s*(\d{3})/);
  return serializedStatus ? Number(serializedStatus[1]) : null;
}

function createProfileReply(question) {
  const normalizedQuestion = question.toLowerCase();

  if (/\b(skill|skills|technology|technologies|tech|stack|tool|tools|framework|language)\b/.test(normalizedQuestion)) {
    const skills = [
      ...portfolioData.skills.languages,
      ...portfolioData.skills.web,
      ...portfolioData.skills.core,
      ...portfolioData.skills.tools,
    ];
    return `Gargi's skills include ${skills.slice(0, 8).join(', ')}. She also works with ${skills.slice(8, 14).join(', ')}.`;
  }

  if (/\b(project|projects|built|portfolio|work sample)\b/.test(normalizedQuestion)) {
    const projects = portfolioData.projects.map(project => project.title);
    return `Gargi's projects include ${projects.slice(0, 3).join(', ')}. She has also built ${projects.slice(3).join(' and ')}.`;
  }

  if (/\b(education|degree|school|college|university|study|studied|padhai)\b/.test(normalizedQuestion)) {
    const { degree, institution, specialization, expected, cgpa } = portfolioData.education;
    return `Gargi is pursuing a ${degree} at ${institution}, specializing in ${specialization}, with graduation expected ${expected}. Her current CGPA is ${cgpa}.`;
  }

  if (/\b(experience|internship|work history|job)\b/.test(normalizedQuestion)) {
    return portfolioData.workExperience;
  }

  if (/\b(hackathon|hackathons|achievement|achievements|award)\b/.test(normalizedQuestion)) {
    return `${portfolioData.hackathons.map(item => `${item.name}: ${item.detail}`).join(' ')} ${portfolioData.academicAchievement.detail}`;
  }

  if (/\b(certification|certifications|certificate|certificates|workshop)\b/.test(normalizedQuestion)) {
    return `Gargi's certifications include ${portfolioData.certifications.join(', ')}.`;
  }

  if (/\b(contact|email|reach|phone|location|sampark)\b/.test(normalizedQuestion)) {
    return `You can contact Gargi at ${portfolioData.email}. She is based in ${portfolioData.location}.`;
  }

  if (/\b(kaun|who|kya)\b/.test(normalizedQuestion)) {
    return `${portfolioData.name} is a ${portfolioData.role}. ${portfolioData.bio}`;
  }

  return `${portfolioData.name} is a ${portfolioData.role}. ${portfolioData.bio}`;
}

app.use(cors());
app.use(express.json());

function cloneDatabase(database) {
  return {
    kudos: database.kudos,
    messages: database.messages.map(message => ({ ...message })),
  };
}

// Read saved values when available, otherwise keep serverless data in memory.
async function readDatabase() {
  if (memoryDatabase) return cloneDatabase(memoryDatabase);

  try {
    const contents = await readFile(databasePath, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    if (!['ENOENT', 'EACCES', 'EROFS'].includes(error.code)) throw error;
    memoryDatabase = { kudos: 0, messages: [] };
    return cloneDatabase(memoryDatabase);
  }
}

// Always update memory first; Vercel's read-only filesystem may reject the file write.
async function writeDatabase(database) {
  memoryDatabase = cloneDatabase(database);
  try {
    await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`);
  } catch (error) {
    console.warn(`Could not persist db.json (${error.code ?? 'unknown'}); kept the update in memory.`);
  }
}

// GET routes send data back to the browser without changing the saved data.
app.get('/api/stats', async (request, response, next) => {
  try {
    const database = await readDatabase();
    response.json({ kudos: database.kudos });
  } catch (error) {
    next(error);
  }
});

// POST routes accept JSON from fetch(), update the data, and send a response.
app.post('/api/kudos', async (request, response, next) => {
  try {
    const database = await readDatabase();
    database.kudos += 1;
    await writeDatabase(database);
    response.json({ kudos: database.kudos });
  } catch (error) {
    next(error);
  }
});


// This route sends the visitor's question and trusted profile context to Gemini on the server.
app.post('/api/chat', async (request, response) => {
  const { message } = request.body ?? {};
  if (typeof message !== 'string' || !message.trim()) {
    return response.status(400).json({ reply: 'Please enter a question about the portfolio.' });
  }

  if (gemini) {
    for (const model of chatModels) {
      try {
        // Keep the API key private here; the browser only receives the generated reply.
        const result = await gemini.models.generateContent({
          model,
          contents: message.trim(),
          config: { systemInstruction: assistantInstructions },
        });
        const reply = result.text?.trim();
        if (reply) return response.json({ reply });
        console.warn(`Gemini ${model} returned an empty reply; trying the next model.`);
      } catch (error) {
        const status = getGeminiErrorStatus(error);
        if (status === 429 || status === 503) {
          console.warn(`Gemini ${model} is busy (HTTP ${status}); trying the next model.`);
        } else {
          console.warn(`Gemini ${model} is unavailable; trying the next model.`);
        }
      }
    }
  } else {
    console.warn('GEMINI_API_KEY is missing; trying local chat fallbacks.');
  }

  try {
    // If Gemini is unavailable, ask the local Ollama service before using a profile-based reply.
    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:0.6b',
        messages: [
          { role: 'system', content: assistantInstructions },
          { role: 'user', content: message.trim() },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (ollamaResponse.ok) {
      const ollamaData = await ollamaResponse.json();
      const reply = ollamaData.message?.content?.trim();
      if (reply) return response.json({ reply });
    }
    console.warn('Ollama returned no usable reply; using the local portfolio profile.');
  } catch {
    console.warn('Ollama is unavailable; using the local portfolio profile.');
  }

  response.json({ reply: createProfileReply(message.trim()) });
});

// Return a friendly JSON error if reading or writing the local file fails.
app.use((error, request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'The server could not save your request.' });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Portfolio API listening on port ${port}`);
  });
}

export default app;