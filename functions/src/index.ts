import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

async function verifyToken(authHeader: string | undefined): Promise<string | null> {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    await getAuth().verifyIdToken(token);
    return token;
  } catch {
    return null;
  }
}

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );
  if (!res.ok) {
    console.error('Gemini API error:', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export const improveTitle = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = await verifyToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'No title provided' });
    return;
  }
  if (title.length > 100) {
    res.status(400).json({ error: 'Title is too long' });
    return;
  }

  const prompt = `Rewrite the following personal memory title to fix grammar and capitalization and make it concise and clear, while keeping the same meaning. Keep it short, a few words to a short phrase, not a full sentence. Reply with only the rewritten title, no preamble, no quotes.\n\nTitle:\n${title.trim()}`;

  try {
    const improved = await callGemini(GEMINI_API_KEY.value(), prompt);
    if (!improved) {
      res.status(502).json({ error: 'AI returned no result' });
      return;
    }
    res.status(200).json({ text: improved });
  } catch (err) {
    console.error('improveTitle crashed:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export const generateDua = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = await verifyToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const topic = req.body?.topic;
  if (typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'No topic provided' });
    return;
  }
  if (topic.length > 200) {
    res.status(400).json({ error: 'Topic is too long' });
    return;
  }

  const prompt = `Generate an authentic Islamic supplication (dua) for the following topic: "${topic.trim()}".

Reply with a JSON object in this exact format, with no markdown, no code fences, just raw JSON:
{"arabic": "<the dua in Arabic script>", "transliteration": "<romanized pronunciation>", "translation": "<the English translation>"}

Requirements:
- If a dua from the Quran or an authentic hadith exists for this topic, use that
- Otherwise compose a sincere, authentic supplication in classical Arabic style
- Transliteration should use simple, readable romanization (e.g. Allahumma, dh, kh)
- Translation must be clear, faithful, natural English
- Return only the JSON object, nothing else`;

  try {
    const text = await callGemini(GEMINI_API_KEY.value(), prompt);
    if (!text) {
      res.status(502).json({ error: 'AI returned no result' });
      return;
    }
    let parsed: { arabic: string; transliteration: string; translation: string };
    try {
      const clean = text.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      res.status(502).json({ error: 'AI returned malformed response' });
      return;
    }
    if (!parsed.arabic || !parsed.transliteration || !parsed.translation) {
      res.status(502).json({ error: 'AI response missing fields' });
      return;
    }
    res.status(200).json({ arabic: parsed.arabic.trim(), transliteration: parsed.transliteration.trim(), translation: parsed.translation.trim() });
  } catch (err) {
    console.error('generateDua crashed:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export const generateNote = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = await verifyToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'No title provided' });
    return;
  }
  if (title.length > 200) {
    res.status(400).json({ error: 'Title is too long' });
    return;
  }

  const prompt = `Write a short personal memory note for a memory titled "${title.trim()}". Write it in first person, warm and natural, 2-3 sentences. Do not invent specific names, places, or numbers that aren't in the title. Reply with only the note text, no preamble or quotes.`;

  try {
    const generated = await callGemini(GEMINI_API_KEY.value(), prompt);
    if (!generated) {
      res.status(502).json({ error: 'AI returned no result' });
      return;
    }
    res.status(200).json({ text: generated });
  } catch (err) {
    console.error('generateNote crashed:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});
