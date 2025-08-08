const apiKey = "AIzaSyC1nWcw7t6JnX2SJBXQmNm87FjWIWP_ER8";
const apiUrlBase = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';

const profileInput = document.getElementById('profileInput');
const generateButton = document.getElementById('generateButton');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const summaryDiv = document.getElementById('result');
const summaryText = document.querySelector('#summaryText p');

async function handleGenerateSummary() {
  errorDiv.style.display = 'none';
  summaryDiv.style.display = 'none';
  summaryText.textContent = '';

  const userText = profileInput.value.trim();
  if (!userText) {
    errorDiv.style.display = 'block';
    errorDiv.querySelector('p').textContent = 'Please enter your skills first.';
    return;
  }

  generateButton.disabled = true;
  loadingDiv.style.display = 'flex';

  const prompt = `
You are an expert career coach. Based on the following skills and experiences,
draft a concise and professional summary for a LinkedIn profile.
The summary should be engaging and highlight the user's strengths.

User's input:
${userText}
  `;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  let retries = 0, maxRetries = 4, delay = 1000;
  async function callApi() {
    try {
      const res = await fetch(apiUrlBase + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 429 && retries < maxRetries) {
          retries++;
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          return callApi();
        }
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (text) {
        summaryText.textContent = text;
        summaryDiv.style.display = 'block';
      } else {
        throw new Error('Invalid response from API — no generated text found.');
      }
    } catch (err) {
      errorDiv.style.display = 'block';
      errorDiv.querySelector('p').textContent = `Error: ${err.message}`;
    } finally {
      loadingDiv.style.display = 'none';
      generateButton.disabled = false;
    }
  }

  callApi();
}

generateButton.addEventListener('click', handleGenerateSummary);

profileInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerateSummary();
});
