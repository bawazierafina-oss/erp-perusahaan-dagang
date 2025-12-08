import { GoogleGenAI, Type } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION, INITIAL_INVENTORY, INITIAL_SALES } from "../constants";
import { Product, SalesOrder, ApsForecast } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

/**
 * APS Agent: Analyzes inventory and sales history to predict demand.
 */
export const runApsAnalysis = async (inventory: Product[], salesHistory: SalesOrder[]): Promise<ApsForecast[]> => {
  try {
    const prompt = `
      Analyze the following inventory levels and recent sales history for a motorcycle dealer.
      
      Current Inventory:
      ${JSON.stringify(inventory.map(i => ({ name: i.name, stock: i.stock, min: i.minStock, id: i.id })))}

      Recent Sales Context:
      ${JSON.stringify(salesHistory.slice(0, 5))} (Sample data)

      Task: 
      1. Identify items with critical low stock (Indent risk).
      2. Predict short-term demand based on general market knowledge of these models (Vario/Beat are high volume).
      3. Suggest order quantities.
      
      Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              productName: { type: Type.STRING },
              currentStock: { type: Type.NUMBER },
              predictedDemand: { type: Type.NUMBER },
              suggestedOrder: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            },
            required: ['productId', 'productName', 'currentStock', 'predictedDemand', 'suggestedOrder', 'reasoning', 'urgency']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ApsForecast[];
    }
    return [];
  } catch (error) {
    console.error("APS Agent Error:", error);
    throw error;
  }
};

/**
 * Audit Agent: Checks a transaction for anomalies.
 */
export const auditTransaction = async (transactionData: any): Promise<{ safe: boolean; analysis: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Audit this transaction for fraud risk or anomalies: ${JSON.stringify(transactionData)}`,
      config: {
        systemInstruction: "You are an Internal Audit AI. Analyze for fraud, unusual amounts, or policy violations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            analysis: { type: Type.STRING }
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return { safe: true, analysis: "AI unavailable" };
  } catch (error) {
    return { safe: true, analysis: "Audit service error" };
  }
};

/**
 * General Chat Assistant
 */
export const chatWithAssistant = async (message: string, contextData: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_FAST,
      config: { systemInstruction: AI_SYSTEM_INSTRUCTION }
    });

    const response = await chat.sendMessage({ 
      message: `Context Data: ${contextData}\n\nUser Query: ${message}` 
    });

    return response.text || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "System is currently offline. Please try again later.";
  }
};