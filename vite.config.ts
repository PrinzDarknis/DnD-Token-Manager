import { resolve } from "path";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "html", "index.html"),
        background: resolve(__dirname, "html", "background.html"),
        "context-menu-token-set-character": resolve(
          __dirname,
          "html",
          "context-menu",
          "token-set-character.html"
        ),
      },
    },
  },
});
