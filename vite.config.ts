import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Project site: https://thetinywisdom.github.io/blog-to-carousel/
const pagesBase = "/blog-to-carousel/";

// GitHub Pages has no SPA rewrite. Unknown paths serve 404.html, so the
// production build copies index.html there and skips Jekyll processing.
function githubPagesSpaFallback(): Plugin {
  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    writeBundle(options) {
      const dir = options.dir ?? path.resolve(__dirname, "dist");
      const indexPath = path.join(dir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      fs.copyFileSync(indexPath, path.join(dir, "404.html"));
      fs.writeFileSync(path.join(dir, ".nojekyll"), "");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: pagesBase,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), githubPagesSpaFallback()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
