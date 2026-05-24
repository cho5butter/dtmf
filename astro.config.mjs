import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://piporu.c5bt.jp",
  integrations: [solid()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["solid-js", "solid-js/web"],
    },
    build: {
      target: "es2022",
    },
  },
});
