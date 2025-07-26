// lib/geminiApi.js
import { geminiModel } from "./firebase";

export async function fetchGeminiResponse(prompt) {
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text = result.response.text();
    text = text
      .replace(/\n{2,}/g, "\n\n")    // No more than 2 line breaks in a row
      .replace(/[ \t]+/g, " ")       // Collapse multiple spaces/tabs into one
      .replace(/ +\n/g, "\n")        // Remove trailing spaces at line end
      .trim();                       // Remove starting/ending whitespace

    return text || "Sorry, I didn't understand that.";
  } catch (err) {
    console.error("Firebase Gemini Error:", err);
    return "There was an error processing your request.";
  }
}