
const API_KEY = ''; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function callAI(userInput) {
  const prompt = `You are an expert career coach specialising in LinkedIn profiles.
Based on the skills and experience below, write a SHORT, punchy LinkedIn "About" summary.
STRICT rules:
- Maximum 3 paragraphs, maximum 220 words total
- First paragraph: 1–2 sentence hook — no "I am a…" openers
- Second paragraph: top skills + one standout achievement
- Third paragraph: one sentence on what they're looking for
- Tone: confident, human, zero corporate jargon
- Plain text only, no bullet points, no markdown

User's input: ${userInput}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'API Error');
  }

  const data = await res.json();
  // Gemini's response path is a bit nested
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error('No summary returned.');
  return text;
}
