import { type RouteDefinition } from "@solidjs/router";
import { For, Match, Switch, createResource } from "solid-js";
import { getRandomGame } from "~/lib/api";

export const route = {
  // TODO(serhalp) Is this even desirable? Does this defeat the purpose of <Suspense>?
  preload() {
    getRandomGame();
  },
} satisfies RouteDefinition;

const ANSWER_LABELS = ["A", "B", "C", "D"];

const Answer = (props: { index: number; prompt: string }) => {
  return (
    <>
      <dt>{ANSWER_LABELS[props.index]}</dt>
      <dd>{props.prompt}</dd>
    </>
  );
};

export default function Play() {
  const [game] = createResource(async () => getRandomGame());

  return (
    <div class="game">
      <h3>Which is the real prompt?</h3>

      <Switch>
        <Match when={game.loading}>Loading game...</Match>
        <Match when={game.error}>
          <span>Error: {game.error}</span>
        </Match>
        <Match when={game()}>
          {(() => {
            const { userPromptId, generatedImage, prompts } = game()!;

            return (
              <>
                <img
                  src={`data:image/png;base64, ${generatedImage.blob}`}
                  alt="AI-generated image"
                  width="500"
                />
                <dl class="answers">
                  <For each={prompts}>
                    {(prompt, index) => (
                      <Answer index={index()} prompt={prompt} />
                    )}
                  </For>
                </dl>
              </>
            );
          })()}
        </Match>
      </Switch>
    </div>
  );
}
