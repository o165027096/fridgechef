export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ingredients, diet } = req.body;
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' });
  }

  const dietNote = diet && diet !== 'none' ? `Dietary preference: ${diet}.` : '';
  const prompt = `You are a helpful cooking assistant. The user has these ingredients: ${ingredients.join(', ')}. ${dietNote}
Suggest exactly 3 simple recipes they can make tonight using mainly these ingredients (they may have basic pantry items like salt, oil, pepper).
Respond ONLY with valid JSON, no markdown, no explanation. Format:
{"recipes":[{"name":"Recipe Name","time":"25 mins","difficulty":"Easy","description":"One sentence description.","steps":["Step 1","Step 2","Step 3","Step 4"]}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(c => c.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate recipes' });
  }
}
