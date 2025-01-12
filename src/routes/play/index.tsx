import {
  useAction,
  useSubmission,
} from "@solidjs/router";
import { For, Match, Switch, createResource, createEffect, onCleanup, createSignal } from "solid-js";
import { getRandomGame, submitAnswer as originalSubmitAnswer } from "~/lib/api";
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

const ANSWER_LABELS = ["A", "B", "C", "D"];

const Answer = (props: {
  index: number;
  prompt: string;
  onSelect: (prompt: string) => unknown;
  isSelected?: boolean;
}) => {
  const label = ANSWER_LABELS[props.index];
  
  createEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === label && !e.metaKey && !e.ctrlKey && !e.altKey) {
        props.onSelect(props.prompt);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    onCleanup(() => document.removeEventListener('keydown', handleKeyPress));
  });

  return (
    <Card
      class={`cursor-pointer transition-colors ${
        props.isSelected ? 'bg-accent' : 'hover:bg-accent'
      }`}
      onClick={() => props.onSelect(props.prompt)}
    >
      <CardContent class="flex gap-4 p-6">
        <Button
          variant="outline"
          size="sm"
          class="h-8 w-8 p-0 flex-shrink-0 flex-grow-0"
        >
          {label}
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
  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);

  return (
    <div class="container mx-auto px-4 md:h-[calc(100vh-theme(spacing.48)-theme(spacing.4))] flex flex-col mt-4">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-4">
        <h3 class="text-2xl font-semibold">Which is the real prompt?</h3>
        <Button
          variant="default"
          size="default"
          onClick={() => {
            submittingAnswer.clear();
            setSelectedIndex(null);
            refetch();
          }}
          class="font-medium"
        >
          Play another
        </Button>
      </div>

      <Switch>
        <Match when={game.loading}>
          <div class="space-y-4 w-full">
            <Skeleton height={300} />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <For each={[1,2,3,4]}>{() =>
                <Skeleton height={96} />
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
              <Card class="flex-1 flex flex-col min-h-0">
                <CardContent class="p-6 flex flex-col h-full gap-4">
                  <div class="flex-1 min-h-0 flex items-center justify-center">
                    <img
                      src={`data:image/png;base64, ${generatedImage.blob}`}
                      alt="AI-generated image"
                      class="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div class="text-center">
                    {submittingAnswer.pending === false
                      ? typeof submittingAnswer.result === "boolean"
                        ? submittingAnswer.result === true
                          ? <span class="text-success-foreground">✅ Correct!</span>
                          : <span class="text-destructive">❌ Incorrect!</span>
                        : "Oops, something went wrong"
                      : "​"}
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <For each={prompts}>
                      {(prompt, index) => (
                        <Answer
                          index={index()}
                          prompt={prompt}
                          isSelected={selectedIndex() === index()}
                          onSelect={async (prompt: string) => {
                            setSelectedIndex(index());
                            submittingAnswer.clear();
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