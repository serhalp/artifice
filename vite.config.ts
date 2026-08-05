import netlify from "@netlify/vite-plugin";
import { solidStart } from "@solidjs/start/config";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [
      solidStart(),
      netlify({
        build: {
          enabled: true,
        },
      }),
    ],
  };
});
