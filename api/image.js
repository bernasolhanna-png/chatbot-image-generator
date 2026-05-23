// api/image.js — Vercel Serverless Function
// Uses OpenAI DALL-E 2 (available on free/starter tier)
// Store your key in Vercel: Settings > Environment Variables > OPENAI_API_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, size = '1024x1024' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // DALL-E 2 supports: 256x256, 512x512, 1024x1024 only
  const validSizes = ['256x256', '512x512', '1024x1024'];
  const imageSize = validSizes.includes(size) ? size : '512x512';

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // OPENAI_API_KEY — set this in Vercel Dashboard > Settings > Environment Variables
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-2',   // dall-e-2 works on free/starter OpenAI accounts
        prompt: prompt,
        n: 1,
        size: imageSize
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({ error: 'No image URL returned from OpenAI' });
    }

    return res.status(200).json({ url: imageUrl });

  } catch (err) {
    console.error('Image API error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
