import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { submitUserPrompt } from "~/lib/api";
import { Button } from "~/components/ui/button"
import { TextField, TextFieldInput } from "~/components/ui/text-field"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export default function Home(_props: RouteSectionProps) {
  const submittingUserPrompt = useSubmission(submitUserPrompt);
  let inputRef!: HTMLInputElement;

  return (
    <main class="flex flex-col items-center justify-center p-8">
      <Button asChild size="lg" class="mb-8">
        <a href="/play">Play a game</a>
      </Button>

      <Card class="w-full max-w-5xl">
        <CardHeader>
          <CardTitle class="text-xl text-center">... or submit your own prompt:</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={submitUserPrompt}
            method="post"
            onSubmit={(e) => {
              if (!inputRef.value.trim()) e.preventDefault();
              setTimeout(() => (inputRef.value = ""));
            }}
          >
            <TextField>
              <TextFieldInput
                name="prompt"
                placeholder="e.g. a dog with cat's ears riding a bicycle"
                ref={inputRef}
                autofocus
              />
            </TextField>
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
        </CardContent>
      </Card>
    </main>
  );
}
