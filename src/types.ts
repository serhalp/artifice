export interface UserPrompt {
  id: string;
  userInputPrompt: string;
}

export interface GeneratedImage {
  /**
   * Base64 encoded image payload
   */
  blob: string;
  mimeType?: string;
}

export interface DecoyPrompt {
  prompt: string;
}

export interface Game {
  userPromptId: string;
  generatedImage: GeneratedImage;
  prompts: string[];
}
