export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ingredients, diet, goal, count = 10 } = req.body;
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' });
  }

  const dietNote = diet && diet !== 'none' ? `Dietary preference: ${diet}.` : '';
  const goalNote = goal && goal !== 'none' ? `Fitness goal: ${goal}.` : '';

  const prompt = `You are a professional chef and nutritionist. The user has these ingredients: ${ingredients.join(', ')}. ${dietNote} ${goalNote}
Generate exactly ${count} recipes using mainly these ingredients (basic pantry items like salt, oil, pepper are available).
Respond ONLY with valid JSON, no markdown, no explanation. Use this exact format:
{"recipes":[{"name":"Recipe Name","time":"25 mins","difficulty":"Easy","servings":2,"description":"One sentence overview.","fitness_tip":"Why this suits the fitness goal.","ingredients":["200g chicken breast","2 cups rice"],"seasoning":["1 tsp salt","2 tbsp soy sauce","0.5 tsp black pepper"],"nutrition":{"calories":450,"protein":38,"carbs":42,"fat":9,"fiber":3,"sugar":2},"steps":["Step 1 detail.","Step 2 detail."]}]}
Rules: nutrition values are per serving (numbers only, no units). fitness_tip must be specific to the goal. seasoning must include exact measurements.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 5000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate recipes' });
  }
}
