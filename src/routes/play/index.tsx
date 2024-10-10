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
      <dt class="answer-label" onClick={() => props.onSelect(props.prompt)}>
        {ANSWER_LABELS[props.index]}
      </dt>
      <dd class="answer-text" onClick={() => props.onSelect(props.prompt)}>
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
    <div class="game">
      <h3>Which is the real prompt?</h3>

      <Switch>
        <Match when={game.loading}>Loading game...</Match>
        <Match when={game.error}>
          <span>Error: {game.error}</span>
        </Match>

        <Match when={submittingAnswer.pending === true}>
          Submitting answer...
        </Match>
        <Match when={submittingAnswer.error}>
          Error: {submittingAnswer.error}
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

                <div>
                  {submittingAnswer.pending === false
                    ? typeof submittingAnswer.result === "boolean"
                      ? submittingAnswer.result === true
                        ? "✅ Correct!"
                        : "❌ Incorrect!"
                      : "Oops, something went wrong"
                    : null}
                </div>

                <dl>
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
