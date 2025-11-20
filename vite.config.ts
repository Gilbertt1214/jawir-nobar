import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig((env: ConfigEnv) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/__vidlink": {
        target: "https://vidlink.pro",
        changeOrigin: true,
        secure: true,
        rewrite: (path: string) => path.replace(/^\/__vidlink/, ""),
      },
    },
  },
  plugins: [react(), env.mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: [],
  },
}));
