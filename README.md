# Artifice

Guess the real source prompt for an image created by generative AI. Beware the decoy prompts also created by generative AI from that image.

## Development

This is a [SolidStart](https://start.solidjs.com) site.

It uses the [SolidUI](https://www.solid-ui.com/) component library and [TailwindCSS](https://tailwindcss.com/) for styling.

Images (DALL-E 3) and decoy prompts (GPT-4o mini) are generated with [OpenAI](https://www.npmjs.com/package/openai).

It is deployed to [Netlify](https://www.netlify.com/).

It persists game data in [Netlify Blobs](https://docs.netlify.com/blobs/overview/).

It uses the [PNPM](https://pnpm.io/) package manager.

### Prerequisites

You need the [Netlify CLI](https://developers.netlify.com/cli/) for local development. (This is required to get local Netlify Blobs emulation.)

### 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command            | Action                                          |
| :----------------- | :---------------------------------------------- |
| `pnpm install`     | Install dependencies                            |
| `netlify dev`      | Start local dev server                          |
| `pnpm run build`   | Build production site to `./dist/`              |
