import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
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
            "/api": {
                target: "https://api.themoviedb.org/3",
                changeOrigin: true,
                secure: true,
                rewrite: (path: string) => {
                    // Get API key from environment variable
                    const apiKey =
                        process.env.VITE_TMDB_API_KEY ||
                        "9998d44e51ed7634a06c4198b289bfe4";
                    const separator = path.includes("?") ? "&" : "?";
                    return (
                        path.replace(/^\/api/, "") +
                        `${separator}api_key=${apiKey}`
                    );
                },
            },
            "/nekopoi": {
                target: "https://nekopoi.care",
                changeOrigin: true,
                secure: false,
                rewrite: (path: string) => path.replace(/^\/nekopoi/, ""),
                configure: (proxy, _options) => {
                    proxy.on("proxyReq", (proxyReq, req, _res) => {
                        proxyReq.setHeader(
                            "User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        );
                        proxyReq.setHeader("Accept", "application/json");
                        console.log("Proxying Nekopoi request:", req.url);
                    });
                },
            },
            // Sanka Nekopoi API Proxy (Hentai)
            "/sanka-neko": {
                target: "https://www.sankavollerei.com",
                changeOrigin: true,
                secure: true,
                rewrite: (path: string) =>
                    path.replace(/^\/sanka-neko/, "/anime/neko"),
                configure: (proxy, _options) => {
                    proxy.on("proxyReq", (proxyReq, req, _res) => {
                        proxyReq.setHeader(
                            "User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        );
                        proxyReq.setHeader("Accept", "application/json");
                        console.log("Proxying Sanka Nekopoi request:", req.url);
                    });
                    proxy.on("error", (err, _req, _res) => {
                        console.error("Sanka Nekopoi proxy error:", err);
                    });
                },
            },
            // Sanka Otakudesu API Proxy (Anime)
            "/sanka-anime": {
                target: "https://www.sankavollerei.com",
                changeOrigin: true,
                secure: true,
                rewrite: (path: string) =>
                    path.replace(/^\/sanka-anime/, "/anime"),
                configure: (proxy, _options) => {
                    proxy.on("proxyReq", (proxyReq, req, _res) => {
                        proxyReq.setHeader(
                            "User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        );
                        proxyReq.setHeader("Accept", "application/json");
                        console.log("Proxying Sanka Anime request:", req.url);
                    });
                    proxy.on("error", (err, _req, _res) => {
                        console.error("Sanka Anime proxy error:", err);
                    });
                },
            },

            "/tv": {
                target: "https://api.themoviedb.org/3",
                changeOrigin: true,
                secure: true,
                timeout: 60000,
                proxyTimeout: 60000,
                rewrite: (path: string) => {
                    const apiKey =
                        process.env.VITE_TMDB_API_KEY ||
                        "9998d44e51ed7634a06c4198b289bfe4";
                    const separator = path.includes("?") ? "&" : "?";
                    return `${path}${separator}api_key=${apiKey}`;
                },
            },
            "/movie": {
                target: "https://api.themoviedb.org/3",
                changeOrigin: true,
                secure: true,
                timeout: 60000,
                proxyTimeout: 60000,
                rewrite: (path: string) => {
                    const apiKey =
                        process.env.VITE_TMDB_API_KEY ||
                        "9998d44e51ed7634a06c4198b289bfe4";
                    const separator = path.includes("?") ? "&" : "?";
                    return `${path}${separator}api_key=${apiKey}`;
                },
            },
            "/search": {
                target: "https://api.themoviedb.org/3",
                changeOrigin: true,
                secure: true,
                timeout: 60000,
                proxyTimeout: 60000,
                rewrite: (path: string) => {
                    const apiKey =
                        process.env.VITE_TMDB_API_KEY ||
                        "9998d44e51ed7634a06c4198b289bfe4";
                    const separator = path.includes("?") ? "&" : "?";
                    return `${path}${separator}api_key=${apiKey}`;
                },
            },
        },
    },
    plugins: [react(), env.mode === "development" && componentTagger()].filter(
        Boolean
    ),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        include: [],
    },
    build: {
        // Production optimizations
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        // Code splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom", "react-router-dom"],
                    "ui-vendor": [
                        "@radix-ui/react-dialog",
                        "@radix-ui/react-dropdown-menu",
                        "@radix-ui/react-scroll-area",
                    ],
                    "query-vendor": ["@tanstack/react-query", "axios"],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
    },
}));
