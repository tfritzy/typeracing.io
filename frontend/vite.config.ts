import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        "404": "404.html",
        "main": "index.html",
        "français": "français.html",
        "español": "español.html",
        "deutsch": "deutsch.html",
        "italiano": "italiano.html",
        "português": "português.html",
        "dutch": "dutch.html",
        "polski": "polski.html",
        "русский": "русский.html",
        "हिंदी": "हिंदी.html",
        "copypastas": "copypastas.html",
        "shakespeare": "shakespeare.html",
        "python": "python.html",
        "csharp": "csharp.html",
        "typescript": "typescript.html",
        "code": "code.html"
},
    },
  },
});