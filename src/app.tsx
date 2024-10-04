import { type RouteSectionProps, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "./app.css";

const Layout = (props: RouteSectionProps) => (
  <>
    <header>
      <h1>
        <a href="/">Artifice</a>
      </h1>
      <h2>
        Guess the real source prompt for the gen AI image. Beware the decoys!
      </h2>
    </header>

    <main>
      <Suspense>{props.children}</Suspense>
    </main>
  </>
);
export default function App() {
  return (
    <Router root={Layout}>
      <FileRoutes />
    </Router>
  );
}
