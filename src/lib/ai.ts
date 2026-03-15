import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const anthropic = new Anthropic();
const google = new GoogleGenAI({});

const DECOY_MODEL = "claude-haiku-4-5-20251001";
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

const extractText = (
  content: Anthropic.Messages.Message["content"],
): string =>
  content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("\n")
    .trim();

const parseStringArray = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === "string")) {
      return parsed.slice(0, 3);
    }
  } catch {
    // Continue to fallback parsing if strict JSON parsing fails.
  }

  return value
    .split("\n")
    .map(line => line.replace(/^\s*[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
};

export const generateImage = async (
  prompt: string,
): Promise<{ blob: string; mimeType: string }> => {
  const response = await google.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
    },
  });

  const imagePart = response.candidates
    ?.flatMap(candidate => candidate.content?.parts ?? [])
    .find(part => part.inlineData?.data != null && part.inlineData.data.length > 0);

  if (imagePart?.inlineData?.data == null || imagePart.inlineData.data.length === 0) {
    throw new Error("Image model did not return an image");
  }

  return {
    blob: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? "image/png",
  };
};

export const generateDecoyPrompts = async (
  generatedImage: { blob: string; mimeType: string },
): Promise<string[]> => {
  const mimeType =
    generatedImage.mimeType === "image/jpeg" ||
    generatedImage.mimeType === "image/png" ||
    generatedImage.mimeType === "image/gif" ||
    generatedImage.mimeType === "image/webp"
      ? generatedImage.mimeType
      : "image/png";

  const message = await anthropic.messages.create({
    model: DECOY_MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
Create 3 plausible image-generation prompts for the attached image.
Return exactly a JSON array of 3 strings.
Rules:
- Each prompt should be a single sentence.
- Prompts should describe visually similar scenes.
- No extra text outside the JSON array.
`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: generatedImage.blob,
            },
          },
        ],
      },
    ],
  });

  const decoys = parseStringArray(extractText(message.content));
  if (decoys.length !== 3) {
    throw new Error("Model did not return exactly 3 decoy prompts");
  }
  return decoys;
};
