import { NowRequest, NowResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Simple server-side proxy to call the Generative Language API using a server-side API key.
// This endpoint accepts a POST body with { action: 'generateContent', payload } and forwards
// the call to Google using the server-side API key stored in env `GOOGLE_API_KEY`.

const MAX_RETRIES = 5;

async function retryFetch(fn: () => Promise<any>) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      // If it's a 429-like error, retry with exponential backoff
      const status = err?.status || err?.response?.status;
      if (attempt >= MAX_RETRIES || (status && status !== 429)) throw err;
      const wait = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

export default async function handler(req: NowRequest, res: NowResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing GOOGLE_API_KEY' });
  }

  const body = req.body || {};
  const action = body.action;
  const payload = body.payload || {};

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (action === 'generateContent') {
      const result = await retryFetch(() => ai.models.generateContent(payload));
      return res.status(200).json(result);
    }

    // Fallback: echo
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error: any) {
    console.error('Proxy error', error?.message || error);
    // Try to unwrap known structures
    if (error && error.status) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: String(error) });
  }
}
