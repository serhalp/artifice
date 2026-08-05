import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [
      solidStart(),
      nitro({
        preset: "netlify",
      }),
    ],
  };
});
