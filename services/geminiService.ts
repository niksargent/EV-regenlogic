import { GoogleGenAI } from "@google/genai";
import { SimulationResult, SimulationParams } from "../types";

export const analyzeSimulation = async (
  params: SimulationParams,
  results: SimulationResult
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Gemini API key not found. Analysis is only available when running in Google AI Studio or with a configured API_KEY.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const strategyAName = params.applyRegenToStrategyA 
    ? "Strategy A (Coast then Regen at end)" 
    : "Strategy A (Pure Coast - Engine Off)";

  const prompt = `
    You are an expert EV engineer. Analyze the following simulation data comparing two stopping strategies for an electric vehicle.
    
    Parameters:
    - Mass: ${params.mass} kg
    - Initial Speed: ${params.initialSpeed} km/h
    - Target Distance: ${params.distance} m
    - Drag Coefficient: ${params.dragCoefficient}
    - Regen Efficiency: ${(params.regenEfficiency * 100).toFixed(1)}%
    
    Results:
    ${strategyAName}:
    - Final Distance: ${results.summary.finalDistanceA.toFixed(1)} m
    - Did it reach target? ${results.summary.didReachTargetA ? 'Yes' : 'No (Stopped short)'}
    - Time taken: ${results.summary.timeA.toFixed(1)} s
    - Net Energy Used: ${results.summary.energyA.toFixed(2)} Wh
    (Negative means net energy gain/regen)

    Strategy B (Maintain Speed then Regen Brake):
    - Final Distance: ${results.summary.finalDistanceB.toFixed(1)} m
    - Time taken: ${results.summary.timeB.toFixed(1)} s
    - Net Energy Used (Total): ${results.summary.energyB.toFixed(2)} Wh
    
    Please provide a concise analysis:
    1. Which strategy is more energy efficient for this specific scenario and why?
    2. How does the modified coasting strategy (if enabled) compare to maintaining speed?
    3. Analyze the physics trade-off (Drag losses vs Time vs Regen recovery).
    
    Keep the tone technical but accessible. Max 200 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return "Unable to generate analysis at this time. Please check your network connection or API usage limits.";
  }
};