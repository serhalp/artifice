import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    // @ts-expect-error(serhalp) -- This is because I'm opting into nitropack nightly which adds
    // this, but SolidStart doesn't know I'm doing this.
    compatibilityDate: "2024-09-24",
  },
});
