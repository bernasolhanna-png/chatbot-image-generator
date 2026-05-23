// api/chat.js — Vercel Serverless Function
// Uses Groq API (FREE) with Llama 3 — no quota issues
// Store your key in Vercel: Settings > Environment Variables > GROQ_API_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages array required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // GROQ_API_KEY — set this in Vercel Dashboard > Settings > Environment Variables
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 500,
        messages: [
          { role: 'system', content: system || 'You are a helpful Sephora beauty assistant.' },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const content = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    return res.status(200).json({ content });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
