import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { submitUserPrompt } from "~/lib/api";

export default function Home(_props: RouteSectionProps) {
  const submittingUserPrompt = useSubmission(submitUserPrompt);

  let inputRef!: HTMLInputElement;
  return (
    <main class="flex flex-col items-center justify-center p-8">
      <a 
        href="/play"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mb-8"
      >
        Play a game
      </a>

      <div class="w-full max-w-2xl">
        <h2 class="text-xl font-semibold mb-4 text-center">... or submit your own prompt:</h2>
        <form
          action={submitUserPrompt}
          method="post"
          class="w-full"
          onSubmit={(e) => {
            if (!inputRef.value.trim()) e.preventDefault();
            setTimeout(() => (inputRef.value = ""));
          }}
        >
          <input
            name="prompt"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. a dog with cat's ears riding a bicycle"
            ref={inputRef}
            autofocus
          />
        </form>

        <div class="mt-4 text-center text-sm">
          <Switch>
            <Match when={submittingUserPrompt.pending === true}>
              Submitting...
            </Match>
            <Match when={submittingUserPrompt.error}>
              <span class="text-destructive">Error: {submittingUserPrompt.error}</span>
            </Match>
            <Match when={submittingUserPrompt.pending === false}>
              <span class="text-success-foreground">Submitted!</span>
            </Match>
          </Switch>
        </div>
      </div>
    </main>
  );
}
