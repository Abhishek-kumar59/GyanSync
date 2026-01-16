
import { GoogleGenAI } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStudyAdvice = async (history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    // Using gemini-3-flash-preview for general study advice as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history,
      config: {
        systemInstruction: "You are a helpful study assistant. Provide concise, encouraging academic advice, explain difficult concepts, and help students organize their study time. Keep responses friendly and motivating.",
      }
    });

    // Accessing .text property directly
    return  response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The study assistant is currently taking a break. Please try again later.";
  }
};
