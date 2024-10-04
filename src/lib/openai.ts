import OpenAI from "openai";

const openai = new OpenAI();

export const generateImage = async (prompt: string): Promise<string> => {
  const image = await openai.images.generate({
    n: 1,
    model: "dall-e-3",
    response_format: "b64_json",
    prompt,
  });
  return image.data[0].b64_json!;
};

export const generateDecoyPrompts = async (
  /**
   * Base64 encoded PNG image
   */
  generatedImageBlobDataUrl: string,
): Promise<string[]> => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
When I provide you with an AI-generated image, you will reply with the prompt that could have been resulted in that image.

Never say anything else.
Never include anything additional in your response.
Do not hesitate.
Do not justify.
Do prefix it or suffix it.
Do not surround it with quotes.
`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              // Strangely named field, but it can be a base64 encoded image
              url: generatedImageBlobDataUrl,
            },
          },
        ],
      },
    ],
    model: "gpt-4o-mini",
    n: 3,
  });

  return completion.choices.map(({ message }) => message.content ?? "");
};
