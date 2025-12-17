// The structured output expected from our tool
export interface SentimentToolOutput {
  rationalScore: number; // Float between -1.0 and 1.0
  confidence: number;    // 0.0 to 1.0 (how sure the model is)
  reasoning: string;
  sources: string[];     // URLs found
}

// Application state for the tool execution
export interface ToolState {
  status: 'IDLE' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  data?: SentimentToolOutput;
  error?: string;
  logs: string[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}