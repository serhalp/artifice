import { For, createResource } from "solid-js";
import { useAction } from "@solidjs/router";
import { deleteUserPrompt, getUserPrompts } from "~/lib/api";

export default function ModPage() {
  const [userPrompts, { refetch }] = createResource(async () => getUserPrompts());
  const deletePrompt = useAction(deleteUserPrompt);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt(id);
      await refetch();
    }
  };

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Moderation Panel</h1>
      <div class="space-y-4">
        <For each={userPrompts()}>
          {(prompt) => (
            <div class="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p class="font-mono">{prompt.id}</p>
                <p>{prompt.userInputPrompt}</p>
              </div>
              <button
                onClick={() => handleDelete(prompt.id)}
                class="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}