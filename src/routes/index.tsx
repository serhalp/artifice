import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { submitUserPrompt } from "~/lib/api";

export default function Home(_props: RouteSectionProps) {
  const submittingUserPrompt = useSubmission(submitUserPrompt);

  let inputRef!: HTMLInputElement;
  return (
    <main>
      <a class="play" href={"/play"}>
        <button type="button">Play a game</button>
      </a>

      <hr />

      <h2>... or submit your own prompt:</h2>
      <form
        action={submitUserPrompt}
        method="post"
        onSubmit={(e) => {
          if (!inputRef.value.trim()) e.preventDefault();
          setTimeout(() => (inputRef.value = ""));
        }}
      >
        <input
          name="prompt"
          class="new-prompt"
          placeholder="e.g. a dog with cat's ears riding a bicycle"
          ref={inputRef}
          autofocus
        />
      </form>

      <div>
        <Switch>
          <Match when={submittingUserPrompt.pending === true}>
            Submitting...
          </Match>
          <Match when={submittingUserPrompt.error}>
            Error: {submittingUserPrompt.error}
          </Match>
          <Match when={submittingUserPrompt.pending === false}>
            Submitted!
          </Match>
        </Switch>
      </div>
    </main>
  );
}
