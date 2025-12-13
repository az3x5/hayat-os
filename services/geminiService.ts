
import { GoogleGenAI } from "@google/genai";
import { Habit, HealthMetric, FinanceSummary, Reminder } from '../types';

let genAI: GoogleGenAI | null = null;

// Safely check for process.env to avoid "Uncaught ReferenceError: process is not defined"
const getApiKey = () => {
  try {
    // Only access process if it is defined
    if (typeof process !== 'undefined') {
       const env = process.env; // Safe access
       if (env && env.API_KEY) {
         return env.API_KEY;
       }
    }
  } catch (e) {
    // Ignore error if process is not accessible
  }
  return undefined;
};

const apiKey = getApiKey();

if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI", e);
  }
}

export const generateDailyInsight = async (
  habits: Habit[],
  health: HealthMetric[],
  finance: FinanceSummary,
  reminders: Reminder[]
): Promise<string> => {
  if (!genAI) {
    console.warn("Gemini API Key not found. Returning mock response.");
    return "Focus on your high-priority tasks today to maintain your streak. Your financial health looks great!";
  }

  const prompt = `
    Analyze my current HayatOS status and give me one short, motivating, and actionable sentence (max 25 words).
    
    Data:
    - Habits: ${habits.map(h => `${h.name}: ${h.completed ? 'Done' : 'Pending'} (Streak: ${h.streak})`).join(', ')}
    - Health: ${health.map(h => `${h.type}: ${h.value}`).join(', ')}
    - Finance Balance: $${finance.balance}
    - Pending Reminders: ${reminders.filter(r => !r.completed).length}
    
    Tone: Professional, minimalist, stoic.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Keep pushing forward.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Unable to generate insight at this moment.";
  }
};