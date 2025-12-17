import { GoogleGenAI } from "@google/genai";
import { SentimentToolOutput, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

console.log("Starting sentiment analysis tool");
/**
 * Simulates an MCP Tool Execution.
 * Input: Team Names
 * Output: Structured Sentiment Data with a Rational Number Score.
 */
export const runSentimentAnalysisTool = async (
  team1: string,
  team2: string,
  onLog: (msg: string) => void
): Promise<SentimentToolOutput> => {
  
  onLog(`[Tool:Start] Initializing sentiment analysis for ${team1} vs ${team2}...`);
  
  if (!import.meta.env.VITE_API_KEY) {
    throw new Error("Environment variable VITE_API_KEY is missing.");
  }

  
  console.log("API key present:", !!import.meta.env.VITE_API_KEY);

  const model = "gemini-2.5-flash";
  
  // Prompt updated to request JSON block in markdown since responseMimeType: "application/json" 
  // is not compatible with tool use (googleSearch) in the current API version.
  const prompt = `
    You are a specialized Sentiment Analysis Tool designed to be part of a larger prediction ensemble.
    
    TASK:
    1. Search the web for the latest news, discussions, injury reports, and betting sentiment for the matchup: ${team1} vs ${team2}.
    2. Analyze the semantic meaning of these sources to determine which team is favored.
    3. Output a single RATIONAL NUMBER score (floating point) between -1.0 and 1.0.
    
    SCORING RUBRIC:
    - -1.0: Virtual certainty that ${team1} will win.
    - -0.5: Moderate advantage for ${team1}.
    - 0.0: Perfect toss-up / Dead even.
    - +0.5: Moderate advantage for ${team2}.
    - +1.0: Virtual certainty that ${team2} will win.
    
    OUTPUT FORMAT:
    Provide your final analysis in a valid JSON code block at the end of your response. 
    Strictly follow this structure:
    \`\`\`json
    {
      "rationalScore": <float>,
      "confidence": <float between 0 and 1>,
      "reasoning": "<concise technical explanation>"
    }
    \`\`\`
  `;

  onLog(`[Tool:Search] Querying Google Search Grounding via Gemini...`);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are REMOVED here because they 
        // cause a 400 error when combined with googleSearch tool use.
      },
    });

    onLog(`[Tool:Process] Processing model response...`);

    const text = response.text || "";
    
    // Manually extract JSON from markdown code block
    let data = { rationalScore: 0, confidence: 0, reasoning: "No valid JSON data found in response." };
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        data = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error("JSON Parse Error on block", e);
        // Fallback: try to find any JSON-like structure if block parsing fails
        const fallbackMatch = text.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
            try {
                data = JSON.parse(fallbackMatch[0]);
            } catch (innerE) {
                data.reasoning = "Failed to parse JSON even with fallback.";
            }
        }
      }
    } else {
        // Handle case where model might not use code blocks
        const fallbackMatch = text.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
            try {
                data = JSON.parse(fallbackMatch[0]);
            } catch (e) {
                data.reasoning = text.substring(0, 200) + "...";
            }
        } else {
            data.reasoning = "The model did not return a structured JSON block. Raw response: " + text.substring(0, 100);
        }
    }

    // Extract Sources
    onLog(`[Tool:Extract] Extracting citation URLs...`);
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    const sources: string[] = [];
    if (chunks) {
      chunks.forEach(c => {
        if (c.web?.uri) sources.push(c.web.uri);
      });
    }
    const uniqueSources = [...new Set(sources)];

    onLog(`[Tool:Complete] Analysis finished with score: ${data.rationalScore}`);

    return {
      rationalScore: data.rationalScore ?? 0,
      confidence: data.confidence ?? 0.5,
      reasoning: data.reasoning || "Analysis complete but reasoning was not provided in structured format.",
      sources: uniqueSources
    };

  } catch (error: any) {
    onLog(`[Tool:Error] ${error.message}`);
    throw error;
  }
};