import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://cho5butter.github.io",
  base: "/dtmf/",
  integrations: [solid()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: "es2022",
    },
  },
});
