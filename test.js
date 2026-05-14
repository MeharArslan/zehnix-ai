export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Test if API key exists
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(200).json({
      status: 'ERROR',
      message: 'GEMINI_API_KEY environment variable not found!',
      fix: 'Vercel Settings > Environment Variables mein GEMINI_API_KEY add karo'
    });
  }

  // Test Gemini API call
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say: ZehniX AI is working!' }] }],
          generationConfig: { maxOutputTokens: 50 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        status: 'API_ERROR',
        message: data.error?.message || 'Gemini API error',
        fix: 'API key galat hai ya expire ho gayi. aistudio.google.com se nai key lo.'
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    return res.status(200).json({ status: 'SUCCESS', message: text });

  } catch (err) {
    return res.status(200).json({ status: 'NETWORK_ERROR', message: err.message });
  }
}
