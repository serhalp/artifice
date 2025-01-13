import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import { submitUserPrompt } from "~/lib/api";
import { Button } from "~/components/ui/button"
import { TextField, TextFieldInput } from "~/components/ui/text-field"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ImSpinner2 } from 'solid-icons/im'

export default function Home(_props: RouteSectionProps) {
  const submittingUserPrompt = useSubmission(submitUserPrompt);
  let inputRef!: HTMLInputElement;

  return (
    <div class="flex flex-col items-center justify-center p-8">
      <Button size="lg" class="mb-8">
        <a href="/play">Play a game</a>
      </Button>

      <Card class="w-full max-w-5xl">
        <CardHeader>
          <CardTitle class="text-xl text-center">... or submit your own prompt to the pool:</CardTitle>
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
            <div class="flex gap-2">
              <TextField class="flex-1">
                <TextFieldInput
                  name="prompt"
                  placeholder="e.g. a dog with cat's ears riding a bicycle"
                  ref={inputRef}
                  autofocus
                />
              </TextField>
              <Button type="submit">Submit</Button>
            </div>
          </form>

          <div class="mt-4 text-center text-sm">
            <Switch>
              <Match when={submittingUserPrompt.pending === true}>
                <span class="inline-flex items-center gap-2">
                  <ImSpinner2 class="animate-spin" />
                  Submitting...
                </span>
              </Match>
              <Match when={submittingUserPrompt.error}>
                <span class="text-destructive">Error: {submittingUserPrompt.error}</span>
              </Match>
              <Match when={submittingUserPrompt.result === true}>
                <span class="text-success-foreground">Submitted!</span>
              </Match>
            </Switch>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
