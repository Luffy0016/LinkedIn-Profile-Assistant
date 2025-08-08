# LinkedIn Profile Assistant

This is a simple, single-page web application designed to help users quickly draft a professional summary for their LinkedIn profile. It uses the power of the Gemini API to generate engaging, personalized content based on a user's skills and experience.

## ✨ Features

* **AI-Powered Summaries:** Generates a professional and compelling LinkedIn summary using the Gemini API.

* **Simple Interface:** A clean, easy-to-use interface to input your skills and receive a summary.

* **No Setup Required:** The application is a single HTML file that can be run in any web browser without a build process.

* **Responsive Design:** Styled with Tailwind CSS to ensure it looks great on both desktop and mobile devices.

## 🚀 How to Use

To run this application, you must provide your own API key from Google AI Studio.

1.  **Get an API Key:** Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key.

2.  **Download the File:** Save this code as a single HTML file named `index.html`.

3.  **Insert Your API Key:** Open `index.html` in a text editor. Find the following line of code (around line 57):

    ```
    const apiKey = "YOUR_API_KEY_HERE";
    
    ```

    Replace `"YOUR_API_KEY_HERE"` with the key you generated.

4.  **Run the App:** Open the `index.html` file in your web browser.

5.  **Generate a Summary:** Type your key skills and experiences into the text box and click "Generate Summary." The AI-powered summary will appear below.

## 🛠️ Technologies Used

* **HTML:** For the basic structure of the web page.

* **Tailwind CSS:** Used via a CDN for all styling and responsive design.

* **JavaScript:** Powers the interaction and the fetch call to the Gemini API.

* **Gemini 2.5 Flash:** The large language model used to generate the profile summaries.
ries.
