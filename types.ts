export enum AgentStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  TRANSCRIBING = 'TRANSCRIBING', // Speech Agent
  ANALYZING = 'ANALYZING',       // Semantic Agent
  WEAVING = 'WEAVING',           // Story Builder Agent
  ILLUSTRATING = 'ILLUSTRATING', // Visual Agent
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface StorySpace {
  id: string;
  title: string;
  theme: string; // e.g., 'travel', 'personal', 'project'
  coverImage?: string;
  createdAt: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  timestamp: number;
  rawInput?: string; // The transcribed text or user note
  narrative: string; // The AI rewritten story
  mood: string;
  tags: string[];
  illustration?: string; // URL/Base64 of generated image
  mediaType: 'voice' | 'image' | 'text';
}

export interface AgentResponse {
  transcription: string;
  narrative: string;
  mood: string;
  tags: string[];
  illustration?: string;
}

export interface PipelineConfig {
  storyContext: string; // Previous chapters to maintain flow
  style: string;
}