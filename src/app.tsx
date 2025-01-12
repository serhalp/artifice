import { type RouteSectionProps, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "./app.css";

const Layout = (props: RouteSectionProps) => (
  <>
    <div class="min-h-screen bg-background text-foreground">
      <header class="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-muted">
        <h1 class="text-4xl md:text-6xl font-bold text-primary mb-4">
          <a href="/" class="no-underline hover:text-primary/90 transition-colors">
            Artifice
          </a>
        </h1>
        <h2 class="text-xl md:text-2xl text-muted-foreground font-normal max-w-2xl text-center">
          Guess the real source prompt for the gen AI image. Beware the decoys!
        </h2>
      </header>

      <main>
        <Suspense>{props.children}</Suspense>
      </main>
    </div>
  </>
);
export default function App() {
  return (
    <Router root={Layout}>
      <FileRoutes />
    </Router>
  );
}
