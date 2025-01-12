import {
  useAction,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { For, Match, Switch, createResource } from "solid-js";
import { getRandomGame, submitAnswer as originalSubmitAnswer } from "~/lib/api";
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

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
    <Card
      class="cursor-pointer transition-colors hover:bg-accent"
      onClick={() => props.onSelect(props.prompt)}
    >
      <CardContent class="flex gap-4 p-6">
        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0"
        >
          {ANSWER_LABELS[props.index]}
        </Button>
        <p>{props.prompt}</p>
      </CardContent>
    </Card>
  );
};

export default function Play() {
  const [game, { refetch }] = createResource(async () => getRandomGame());
  const submitAnswer = useAction(originalSubmitAnswer);
  const submittingAnswer = useSubmission(originalSubmitAnswer);

  return (
    <div class="container max-w-4xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h3 class="text-2xl font-semibold">Which is the real prompt?</h3>
        <Button
          variant="default"
          size="default"
          onClick={() => {
            submittingAnswer.clear();
            refetch();
          }}
          class="ml-4 font-medium"
        >
          Play another
        </Button>
      </div>

      <Switch>
        <Match when={game.loading}>
          <div class="space-y-4">
            <Skeleton class="h-[300px] w-full" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <For each={[1,2,3,4]}>{() =>
                <Skeleton class="h-24" />
              }</For>
            </div>
          </div>
        </Match>
        <Match when={game.error}>
          <Card>
            <CardContent class="p-6">
              Error: {game.error}
            </CardContent>
          </Card>
        </Match>

        <Match when={submittingAnswer.pending === true}>
          <div class="text-center text-muted-foreground">
            <Skeleton class="h-8 w-32 mx-auto" />
          </div>
        </Match>
        <Match when={submittingAnswer.error}>
          <Card>
            <CardContent class="p-6">
              Error: {submittingAnswer.error}
            </CardContent>
          </Card>
        </Match>

        <Match when={game()}>
          {(() => {
            const { userPromptId, generatedImage, prompts } = game()!;

            return (
              <Card>
                <CardContent class="p-6 space-y-8">
                  <img
                    src={`data:image/png;base64, ${generatedImage.blob}`}
                    alt="AI-generated image"
                    width="500"
                    class="rounded-lg shadow-lg max-w-full h-auto mx-auto"
                  />

                  <div class="text-center">
                    {submittingAnswer.pending === false
                      ? typeof submittingAnswer.result === "boolean"
                        ? submittingAnswer.result === true
                          ? <span class="text-success-foreground">✅ Correct!</span>
                          : <span class="text-destructive">❌ Incorrect!</span>
                        : "Oops, something went wrong"
                      : null}
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </Match>
      </Switch>
    </div>
  );
}
