 // 1. Select the new API key input from the UI
const apiKeyInput   = document.getElementById('apiKeyInput');
const profileInput   = document.getElementById('profileInput');
const generateButton = document.getElementById('generateButton');
const errorDiv       = document.getElementById('error');
const errorMessage   = document.getElementById('error-message');
const resultSection  = document.getElementById('result');
const summaryText    = document.getElementById('summaryText');
const copyBtn        = document.getElementById('copyBtn');

let isLoading = false;

// 2. Load saved key from your browser's memory so you don't have to re-paste it
if (localStorage.getItem('gemini_api_key')) {
  apiKeyInput.value = localStorage.getItem('gemini_api_key');
}

// 3. Save the key locally whenever you type it in the box
apiKeyInput.addEventListener('input', (e) => {
  localStorage.setItem('gemini_api_key', e.target.value);
});

async function callAI(userInput, key) {
  // We use the key provided in the UI box
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${key}`;

  const prompt = `You are an expert career coach specialising in LinkedIn profiles.
Based on the skills and experience below, write a SHORT, punchy LinkedIn "About" summary.
STRICT rules:
- Maximum 3 paragraphs, maximum 220 words total
- First paragraph: 1–2 sentence hook — no "I am a…" openers
- Second paragraph: top skills + one standout achievement
- Third paragraph: one sentence on what they're looking for
- Tone: confident, human, zero corporate jargon
- Plain text only, no bullet points, no markdown`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt + "\n\nUser Input: " + userInput }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned.";
}

async function handleGenerate() {
  if (isLoading) return;
  
  // Get the key and input at the moment the button is clicked
  const key = apiKeyInput.value.trim();
  const userInput = profileInput.value.trim();

  if (!key) {
    showError('Please enter your Gemini API Key in the settings box at the top.');
    return;
  }
  if (userInput.length < 20) {
    showError('Tell me a bit more! Need at least 20 characters.');
    return;
  }

  hideError();
  hideResult();
  setLoading(true);

  try {
    const summary = await callAI(userInput, key);
    summaryText.textContent = summary;
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    showError(err.message || 'Something went wrong.');
  } finally {
    setLoading(false);
  }
}

// UI State Helpers
function setLoading(state) {
  isLoading = state;
  generateButton.disabled = state;
  generateButton.classList.toggle('loading', state);
  generateButton.querySelector('.btn-label').textContent = state ? 'Generating…' : 'Generate Summary';
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorDiv.hidden = false;
}

function hideError() { errorDiv.hidden = true; }
function hideResult() { resultSection.hidden = true; }

// Listeners
generateButton.addEventListener('click', handleGenerate);
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(summaryText.textContent);
  copyBtn.querySelector('span').textContent = 'Copied!';
  setTimeout(() => copyBtn.querySelector('span').textContent = 'Copy', 2000);
});

profileInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleGenerate();
  }
});
