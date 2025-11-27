import { AgentStatus } from "./types";

export const APP_NAME = "LifeTales";

export const THEME_COLORS = {
  primary: "indigo",
  secondary: "rose",
  accent: "teal",
  background: "slate",
};

export const SAMPLE_STORIES = [
  {
    id: "1",
    title: "Kyoto Spring",
    theme: "Travel",
    createdAt: Date.now(),
    chapters: [],
    coverImage: "https://picsum.photos/seed/kyoto/800/600"
  },
  {
    id: "2",
    title: "The Garden Project",
    theme: "Project",
    createdAt: Date.now() - 100000,
    chapters: [],
    coverImage: "https://picsum.photos/seed/garden/800/600"
  }
];

export const AGENT_MESSAGES: Record<AgentStatus, string> = {
  [AgentStatus.IDLE]: "Ready to listen...",
  [AgentStatus.LISTENING]: "Listening...",
  [AgentStatus.TRANSCRIBING]: "Speech Agent is transcribing...",
  [AgentStatus.ANALYZING]: "Semantic Agent is finding meaning...",
  [AgentStatus.WEAVING]: "Story Builder is writing the chapter...",
  [AgentStatus.ILLUSTRATING]: "Visual Agent is painting the scene...",
  [AgentStatus.COMPLETED]: "Memory preserved.",
  [AgentStatus.ERROR]: "Something went wrong.",
};

// Prompt templates for Gemini
export const PROMPTS = {
  STORY_BUILDER: (context: string, input: string) => `
    You are the Story Builder Agent for 'LifeTales'. 
    Your goal is to transform a raw memory fragment (transcription or note) into a beautiful, coherent narrative paragraph.
    
    Context from previous chapters: "${context}"
    
    New Input Fragment: "${input}"
    
    Instructions:
    1. Write a single, beautifully crafted paragraph (approx 50-80 words).
    2. Match the tone: warm, reflective, and personal.
    3. Ensure smooth continuity if context exists.
    4. Do not invent facts, but enhance the prose.
    5. Output ONLY the narrative text.
  `,
  SEMANTIC_ANALYSIS: `
    Analyze the following text. Return a JSON object with:
    - "mood": a single adjective (e.g., "Peaceful", "Excited", "Melancholic").
    - "tags": an array of 3 short relevant keywords.
    
    Text: 
  `,
  VISUAL_GENERATION: (narrative: string, mood: string) => `
    Create a soft, semi-abstract digital illustration style prompt for the following scene. 
    Scene: ${narrative}
    Mood: ${mood}
    Style: Soft pastel colors, digital art, rounded shapes, warm lighting, minimalist composition.
  `
};