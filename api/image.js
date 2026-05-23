// api/image.js — Vercel Serverless Function
// Uses Pollinations AI — 100% FREE, no API key needed!
// Just builds a URL and returns it directly

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, size = '512x512' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Parse width and height from size string (e.g. "512x512")
  const [width, height] = size.split('x').map(Number);

  try {
    // Pollinations AI — free, no API key, just a URL
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return res.status(200).json({ url: imageUrl });

  } catch (err) {
    console.error('Image API error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
