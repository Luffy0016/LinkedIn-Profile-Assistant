 /**
 * LinkedIn Profile Assistant - Logic Layer
 * Powered by Google Gemini 1.5 Flash
 */

// 1. Setup - Replace with your key from https://aistudio.google.com/
const API_KEY = 'AIzaSyAzUvgdI1tSSCtBLH3D8VT3Eu_eBvXwmIg'; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// 2. Element Selectors
const profileInput   = document.getElementById('profileInput');
const generateButton = document.getElementById('generateButton');
const errorDiv       = document.getElementById('error');
const errorMessage   = document.getElementById('error-message');
const resultSection  = document.getElementById('result');
const summaryText    = document.getElementById('summaryText');
const copyBtn        = document.getElementById('copyBtn');

let isLoading = false;

// 3. UI State Helpers
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

// 4. Core AI Function
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

User's input:
${userInput}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  
  // Navigate Gemini's response object
  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) throw new Error('Gemini didn\'t return a summary. Please try again.');
  
  return generatedText.trim();
}

// 5. Event Handlers
async function handleGenerate() {
  if (isLoading) return;
  hideError();
  hideResult();

  const userInput = profileInput.value.trim();
  
  // Basic Validation
  if (!userInput) {
    showError('Please enter your skills and experience first.');
    profileInput.focus();
    return;
  }
  if (userInput.length < 20) {
    showError('Tell me a bit more! More detail results in a much better summary.');
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
    console.error("Generation Error:", err);
    showError(err.message || 'Something went wrong. Please check your API key.');
  } finally {
    setLoading(false);
  }
}

async function handleCopy() {
  const text = summaryText.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add('copied');
    copyBtn.querySelector('span').textContent = 'Copied!';
    
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.querySelector('span').textContent = 'Copy';
    }, 2000);
  } catch (err) {
    showError('Failed to copy text.');
  }
}

// 6. Listeners
generateButton.addEventListener('click', handleGenerate);
copyBtn.addEventListener('click', handleCopy);

// Shortcut: Ctrl/Cmd + Enter
profileInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleGenerate();
  }
});

// Clear error on type
profileInput.addEventListener('input', () => {
  if (!errorDiv.hidden) hideError();
});
