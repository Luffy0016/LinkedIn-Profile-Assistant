 const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Warning: Exposing API keys in client-side JS is unsafe for production.
const API_KEY = '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';
const MAX_RETRIES = 4;

const profileInput   = document.getElementById('profileInput');
const generateButton = document.getElementById('generateButton');
const errorDiv       = document.getElementById('error');
const errorMessage   = document.getElementById('error-message');
const resultSection  = document.getElementById('result');
const summaryText    = document.getElementById('summaryText');
const copyBtn        = document.getElementById('copyBtn');

let isLoading = false;

function setLoading(state) {
  isLoading = state;
  generateButton.disabled = state;
  generateButton.classList.toggle('loading', state);
  generateButton.querySelector('.btn-label').textContent = state ? 'Generating…' : 'Generate Summary';
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorDiv.hidden = false;
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorDiv.hidden = true;
  errorMessage.textContent = '';
}

function hideResult() {
  resultSection.hidden = true;
  summaryText.textContent = '';
}

async function callAI(userInput, attempt = 1) {
  const prompt = `You are an expert career coach specialising in LinkedIn profiles.

Based on the skills and experience below, write a SHORT, punchy LinkedIn "About" summary.

STRICT rules:
- Maximum 3 paragraphs, maximum 220 words total
- First paragraph: 1–2 sentence hook — no "I am a…" openers
- Second paragraph: top skills + one standout achievement
- Third paragraph: one sentence on what they're looking for
- Tone: confident, human, zero corporate jargon
- Plain text only, no bullet points, no markdown

User's input:
${userInput}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${API_KEY}`, 
      'HTTP-Referer': 'https://luffy0016.github.io', 
      'X-Title': 'LinkedIn Profile Assistant' 
    },
    body: JSON.stringify({ 
      model: 'meta-llama/llama-3.1-8b-instruct:free', 
      messages: [{ role: 'user', content: prompt }] 
    })
  });

  if (!res.ok) {
    if (res.status === 429 && attempt <= MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      return callAI(userInput, attempt + 1);
    }
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? null;
  if (!text) throw new Error('No summary returned — please try again.');
  return text;
}

async function handleGenerate() {
  if (isLoading) return;
  hideError();
  hideResult();

  const userInput = profileInput.value.trim();
  if (!userInput) {
    showError('Please enter your skills and experience before generating.');
    profileInput.focus();
    return;
  }
  if (userInput.length < 20) {
    showError('Please add a bit more detail — the more you share, the better the summary.');
    profileInput.focus();
    return;
  }

  setLoading(true);
  try {
    const summary = await callAI(userInput);
    summaryText.textContent = summary;
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

async function handleCopy() {
  const text = summaryText.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(summaryText);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }
  copyBtn.classList.add('copied');
  copyBtn.querySelector('span').textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.classList.remove('copied');
    copyBtn.querySelector('span').textContent = 'Copy';
  }, 2000);
}

generateButton.addEventListener('click', handleGenerate);
copyBtn.addEventListener('click', handleCopy);

profileInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleGenerate();
  }
});

profileInput.addEventListener('input', () => {
  if (!errorDiv.hidden) hideError();
});
