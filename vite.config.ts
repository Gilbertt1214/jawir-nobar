import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { componentTagger } from "lovable-tagger";
import { cloudflare } from "@cloudflare/vite-plugin";

// Helper untuk menambahkan TMDB API key ke path
const appendTmdbApiKey = (urlPath: string): string => {
    const apiKey = process.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
        console.warn(
            "VITE_TMDB_API_KEY tidak ditemukan di environment variables"
        );
    }
    const separator = urlPath.includes("?") ? "&" : "?";
    return `${urlPath}${separator}api_key=${apiKey || ""}`;
};

// Konfigurasi proxy untuk TMDB
const createTmdbProxy = (rewritePath?: (path: string) => string) => ({
    target: "https://api.themoviedb.org/3",
    changeOrigin: true,
    secure: true,
    timeout: 60000,
    proxyTimeout: 60000,
    rewrite: (urlPath: string) => {
        const newPath = rewritePath ? rewritePath(urlPath) : urlPath;
        return appendTmdbApiKey(newPath);
    },
});

// Konfigurasi proxy untuk Sanka API
const createSankaProxy = (
    fromPath: string,
    toPath: string,
    logPrefix: string
) => ({
    target: "https://www.sankavollerei.com",
    changeOrigin: true,
    secure: true,
    rewrite: (urlPath: string) =>
        urlPath.replace(new RegExp(`^${fromPath}`), toPath),
    configure: (proxy: any) => {
        proxy.on("proxyReq", (proxyReq: any, req: any) => {
            proxyReq.setHeader(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            );
            proxyReq.setHeader("Accept", "application/json");
            console.log(`Proxying ${logPrefix} request:`, req.url);
        });
        proxy.on("error", (err: Error) => {
            console.error(`${logPrefix} proxy error:`, err);
        });
    },
});

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
                rewrite: (urlPath: string) =>
                    urlPath.replace(/^\/__vidlink/, ""),
            },
            "/api": createTmdbProxy((urlPath) => urlPath.replace(/^\/api/, "")),
            "/nekopoi": {
                target: "https://nekopoi.care",
                changeOrigin: true,
                secure: false,
                rewrite: (urlPath: string) => urlPath.replace(/^\/nekopoi/, ""),
                configure: (proxy: any) => {
                    proxy.on("proxyReq", (proxyReq: any, req: any) => {
                        proxyReq.setHeader(
                            "User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        );
                        proxyReq.setHeader("Accept", "application/json");
                        console.log("Proxying Nekopoi request:", req.url);
                    });
                },
            },
            "/sanka-neko": createSankaProxy(
                "/sanka-neko",
                "/anime/neko",
                "Sanka Nekopoi"
            ),
            "/sanka-anime": createSankaProxy(
                "/sanka-anime",
                "/anime",
                "Sanka Anime"
            ),
            "/tv": createTmdbProxy(),
            "/movie": createTmdbProxy(),
            "/search": createTmdbProxy(),
        },
    },
    plugins: [
        react(),
        cloudflare(),
        env.mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        minify: "terser" as const,
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        } as any,
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
