import {
  useAction,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { For, Match, Switch, createResource } from "solid-js";
import { getRandomGame, submitAnswer as originalSubmitAnswer } from "~/lib/api";

export const route = {
  // TODO(serhalp) Is this even desirable? Does this defeat the purpose of <Suspense>?
  preload() {
    getRandomGame();
  },
} satisfies RouteDefinition;

const ANSWER_LABELS = ["A", "B", "C", "D"];

const Answer = (props: {
  index: number;
  prompt: string;
  onSelect: (prompt: string) => unknown;
}) => {
  return (
    <>
      <dt 
        class="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
        onClick={() => props.onSelect(props.prompt)}
      >
        {ANSWER_LABELS[props.index]}
      </dt>
      <dd 
        class="p-4 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        onClick={() => props.onSelect(props.prompt)}
      >
        {props.prompt}
      </dd>
    </>
  );
};

export default function Play() {
  const [game] = createResource(async () => getRandomGame());
  const submitAnswer = useAction(originalSubmitAnswer);
  const submittingAnswer = useSubmission(originalSubmitAnswer);

  return (
    <div class="container max-w-4xl mx-auto px-4 py-8">
      <h3 class="text-2xl font-semibold mb-8">Which is the real prompt?</h3>

      <Switch>
        <Match when={game.loading}>
          <div class="text-center text-muted-foreground">Loading game...</div>
        </Match>
        <Match when={game.error}>
          <span class="text-destructive">Error: {game.error}</span>
        </Match>

        <Match when={submittingAnswer.pending === true}>
          <div class="text-center text-muted-foreground">Submitting answer...</div>
        </Match>
        <Match when={submittingAnswer.error}>
          <span class="text-destructive">Error: {submittingAnswer.error}</span>
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
                  class="rounded-lg shadow-lg mb-8 max-w-full h-auto mx-auto"
                />

                <div class="text-center mb-8">
                  {submittingAnswer.pending === false
                    ? typeof submittingAnswer.result === "boolean"
                      ? submittingAnswer.result === true
                        ? <span class="text-success-foreground">✅ Correct!</span>
                        : <span class="text-destructive">❌ Incorrect!</span>
                      : "Oops, something went wrong"
                    : null}
                </div>

                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <For each={prompts}>
                    {(prompt, index) => (
                      <Answer
                        index={index()}
                        prompt={prompt}
                        onSelect={async (prompt: string) => {
                          await submitAnswer(userPromptId, prompt);
                        }}
                      />
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
