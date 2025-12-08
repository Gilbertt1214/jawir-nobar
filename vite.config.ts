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
                    // Menambahkan API key ke request TMDB
                    const apiKey = "9998d44e51ed7634a06c4198b289bfe4";
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
                secure: false, // Nekopoi mungkin tidak menggunakan HTTPS
                rewrite: (path: string) => path.replace(/^\/nekopoi/, ""),
                configure: (proxy, _options) => {
                    proxy.on("proxyReq", (proxyReq, req, _res) => {
                        // Tambahkan headers untuk Nekopoi
                        proxyReq.setHeader(
                            "User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        );
                        proxyReq.setHeader("Accept", "application/json");
                        console.log("Proxying Nekopoi request:", req.url);
                    });
                },
            },
            "/nekobocc": {
                target: "https://nekopoi.care", // URL NekoBocc yang benar
                changeOrigin: true,
                secure: true,
                rewrite: (path: string) => path.replace(/^\/nekobocc/, ""),
                configure: (proxy, _options) => {
                    proxy.on("proxyReq", (proxyReq, req, _res) => {
                        proxyReq.setHeader(
                            "User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        );
                        proxyReq.setHeader("Accept", "application/json");
                        console.log("Proxying NekoBocc request:", req.url);
                    });
                },
            },
            // Fallback proxies for direct TMDB access (resolves ETIMEDOUT on /tv and /movie)
            "/tv": {
                target: "https://api.themoviedb.org/3",
                changeOrigin: true,
                secure: true,
                timeout: 60000, // 60s timeout
                proxyTimeout: 60000,
                rewrite: (path: string) => {
                    const apiKey = "9998d44e51ed7634a06c4198b289bfe4";
                    const separator = path.includes("?") ? "&" : "?";
                    return `${path}${separator}api_key=${apiKey}`;
                },
            },
            "/movie": {
                target: "https://api.themoviedb.org/3",
                changeOrigin: true,
                secure: true,
                timeout: 60000, // 60s timeout
                proxyTimeout: 60000,
                rewrite: (path: string) => {
                    const apiKey = "9998d44e51ed7634a06c4198b289bfe4";
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
                    const apiKey = "9998d44e51ed7634a06c4198b289bfe4";
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
}));
