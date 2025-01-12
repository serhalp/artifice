import { randomUUID } from "node:crypto";
import { action, cache } from "@solidjs/router";
import type { DecoyPrompt, Game, GeneratedImage, UserPrompt } from "~/types";
import { storage } from "./db";
import { generateDecoyPrompts, generateImage } from "./openai";
import rootLogger from "./logger";

enum StorageKey {
  UserPrompts = "user-prompts",
}

enum StorageKeyPrefix {
  GeneratedImage = "generated-image",
  DecoyPrompts = "decoy-prompts",
}

const generateUuid = () => {
  "use server";
  return randomUUID();
};

const getGeneratedImageStorageKey = ({ promptId }: { promptId: string }) =>
  `${StorageKeyPrefix.GeneratedImage}:${promptId}`;

const getDecoyPromptsStorageKey = ({ promptId }: { promptId: string }) =>
  `${StorageKeyPrefix.DecoyPrompts}:${promptId}`;

export const getUserPrompts = cache(async () => {
  "use server";
  return (await storage.getItem<UserPrompt[]>(StorageKey.UserPrompts)) ?? [];
}, "getUserPrompts");

const normalizePrompts = (prompts: string[], referencePrompt: string): string[] => {
  // If one prompt has different casing than all the others, the game is too easy.
  const shouldStartWithLowerCase = referencePrompt.charAt(0).toLocaleLowerCase() === referencePrompt.charAt(0);
  if (shouldStartWithLowerCase)
    return prompts.map(prompt => `${prompt.charAt(0).toLocaleLowerCase()}${prompt.slice(1)}`)
  const shouldStartWithUpperCase = referencePrompt.charAt(0).toLocaleUpperCase() === referencePrompt.charAt(0);
  if (shouldStartWithUpperCase)
    return prompts.map(prompt => `${prompt.charAt(0).toLocaleUpperCase()}${prompt.slice(1)}`)
  return prompts;
}

export const submitUserPrompt = action(async (formData: FormData) => {
  "use server";
  const userInputPrompt = formData.get("prompt");
  if (typeof userInputPrompt !== "string") {
    // TODO(serhalp) Apparently you can't just throw.
    throw new Error("Missing or invalid prompt provided");
  }
  // TODO(serhalp) This won't handle concurrent updates. Remodel.
  const userPrompts =
    (await storage.getItem<UserPrompt[]>(StorageKey.UserPrompts)) ?? [];

  const promptId = generateUuid();
  const logger = rootLogger.child({ promptId });
  logger.info("Generating image for prompt");
  const generatedImage = await generateImage(userInputPrompt);
  logger.info("Generated image for prompt");
  logger.info("Saving generated image");
  await storage.setItem<GeneratedImage>(
    getGeneratedImageStorageKey({ promptId }),
    { blob: generatedImage },
  );
  logger.info("Saved generated image");

  logger.info("Generating decoy prompts");
  const generatedImageUrl = `data:image/png;base64,${generatedImage}`;
  const decoyPrompts = await generateDecoyPrompts(generatedImageUrl);
  logger.info("Generated decoy prompts");
  logger.info("Saving decoy prompts");
  await storage.setItem<DecoyPrompt[]>(
    getDecoyPromptsStorageKey({ promptId }),
    normalizePrompts(decoyPrompts, userInputPrompt).map((prompt) => ({ prompt })),
  );
  logger.info("Saved decoy prompts");

  // Save the actual user prompt last to ensure we never try to play an invalid game.
  logger.info("Saving user prompt");
  await storage.setItem<UserPrompt[]>(StorageKey.UserPrompts, [
    ...userPrompts,
    {
      id: promptId,
      userInputPrompt,
    },
  ]);
  logger.info("Saved user prompt");

  return true;
});

const getRandomIndex = <T>(arr: T[]): number =>
  Math.floor(Math.random() * arr.length);

const getRandomElement = <T>(arr: T[]): T => arr[getRandomIndex(arr)];

const shuffleInto = <T>(val: T, arr: T[]) => {
  const i = getRandomIndex(arr);
  return [...arr.slice(0, i), val, ...arr.slice(i)];
};

// TODO(serhalp) Error handling
export const getRandomGame = async (): Promise<Game> => {
  "use server";
  const userPrompts = await getUserPrompts();
  if (userPrompts.length === 0) {
    throw new Error("No user prompts found. Please submit a prompt first.");
  }
  const prompt = getRandomElement(userPrompts);
  const { id: promptId } = prompt;
  const [generatedImage, decoyPrompts] = await Promise.all([
    getGeneratedImage({ promptId }),
    getDecoyPrompts({ promptId }),
  ]);

  if (generatedImage == null)
    throw new Error(
      "Generated image not found for prompt. Something went wrong.",
    );
  if (decoyPrompts == null)
    throw new Error(
      "Decoy prompts not found for prompt. Something went wrong.",
    );

  return {
    userPromptId: promptId,
    generatedImage,
    prompts: shuffleInto(
      prompt.userInputPrompt,
      decoyPrompts.map(({ prompt }) => prompt),
    ),
  };
};

export const getGeneratedImage = cache(
  async ({ promptId }: { promptId: string }) => {
    "use server";
    // TODO(serhalp) Error handling
    return storage.getItem<GeneratedImage>(
      getGeneratedImageStorageKey({ promptId }),
    );
  },
  "getGeneratedImage",
);

export const getDecoyPrompts = cache(
  async ({ promptId }: { promptId: string }) => {
    "use server";
    // TODO(serhalp) Error handling
    return storage.getItem<DecoyPrompt[]>(
      getDecoyPromptsStorageKey({ promptId }),
    );
  },
  "getDecoyPrompts",
);

/**
 * Resolves to a boolean indicating whether the answer is correct.
 */
export const submitAnswer = action(
  async (
    /**
     * The user prompt ID for which the answer is being submitted.
     * This serves as a unique identifier for the game.
     */
    userPromptId: string,
    /**
     * The prompt being submitted as an answer, as is.
     */
    prompt: string,
  ): Promise<boolean> => {
    "use server";
    if (typeof prompt !== "string") {
      throw new Error("Missing or invalid prompt answer provided");
    }

    const userPrompts =
      (await storage.getItem<UserPrompt[]>(StorageKey.UserPrompts)) ?? [];
    const userPrompt = userPrompts.find(({ id }) => id === userPromptId);

    if (userPrompt == null) {
      throw new Error("User prompt not found. Something went wrong.");
    }

    return userPrompt.userInputPrompt === prompt;
  },
);
