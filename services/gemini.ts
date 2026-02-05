
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export async function sendMessage(history: { role: string; content: string }[], message: string) {
  // The GoogleGenAI constructor reads the API key from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  /**
   * GenAI SDK Chat History Requirements:
   * 1. Must alternate 'user' and 'model' roles.
   * 2. The first message in the history must be from the 'user'.
   */
  const chatHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // If the history starts with the model's welcome message, remove it for API compliance
  if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
    chatHistory.shift();
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: chatHistory,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that. Let's try again.";
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    // Check for specific error indicating an invalid/missing API key or model access issue.
    // This string is a reliable indicator that the server-side key is misconfigured.
    if (error?.message?.includes("API key not valid") || error?.message?.includes("Requested entity was not found")) {
      return "API_KEY_ERROR: The API key configured on the server is invalid, missing, or lacks permission for this model. Please contact the administrator.";
    }

    return "Error communicating with the growth diagnostic engine. This can happen due to temporary service interruptions. Please refresh and try again.";
  }
}