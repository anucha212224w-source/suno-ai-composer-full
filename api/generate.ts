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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_API_KEY in environment');
    return res.status(500).json({ error: 'Server missing GOOGLE_API_KEY' });
  }

  // Accept JSON bodies; if body is string try to parse
  let body: any = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.warn('Could not parse request body as JSON');
    }
  }

  const action = body.action;
  const payload = body.payload || {};

  console.info(`/api/generate called - action=${action}");

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (action === 'generateContent') {
      const result = await retryFetch(() => ai.models.generateContent(payload));
      return res.status(200).json(result);
    }

    // Fallback: unknown action
    console.warn('Unknown action in /api/generate:', action);
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error: any) {
    // Detailed logging for debugging (do not leak secrets)
    console.error('Proxy error - message:', error?.message);
    if (error?.response) {
      try {
        console.error('Proxy error - response data:', JSON.stringify(error.response, Object.getOwnPropertyNames(error.response)));
      } catch (e) {
        console.error('Failed to stringify error.response');
      }
    }

    const status = error?.status || error?.response?.status || 500;
    const safeMessage = (process.env.NODE_ENV === 'production') ? 'Server error' : (error?.message || String(error));
    return res.status(status).json({ error: safeMessage });
  }
}
