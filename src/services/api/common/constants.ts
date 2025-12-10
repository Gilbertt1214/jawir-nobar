// API Configuration and Constants

export const API_HOSTS = [
    import.meta.env.VITE_API_BASE_URL || "/__vidlink",
].filter(Boolean);

export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_KEY =
    import.meta.env.VITE_TMDB_API_KEY || "9998d44e51ed7634a06c4198b289bfe4";

export const NEKOPOI_BASE = import.meta.env.VITE_NEKOPOI_PROXY || "/nekopoi";

// Anime Scraper URL (sankavollerei.com)
export const ANIME_SCRAPER_URL =
    import.meta.env.VITE_ANIME_SCRAPER_URL || "https://www.sankavollerei.com";

// Premium streaming providers (prioritized by quality and reliability)
// Updated with working providers as of 2024
export const STREAMING_PROVIDERS = {
    // Tier 1: Premium providers (most reliable)
    vidsrc: "https://vidsrc.xyz/embed",
    vidsrcpro: "https://vidsrc.pro/embed",
    vidlink: "https://vidlink.pro",

    // Tier 2: High quality providers
    vidsrcto: "https://vidsrc.to/embed",
    vidsrcme: "https://vidsrc.me/embed",
    vidsrcxyz: "https://vidsrc.xyz/embed",
    vidsrcpm: "https://vidsrc.pm/embed",

    // Tier 3: Reliable backup providers
    embedsu: "https://embed.su/embed",
    superembed: "https://multiembed.mov/?video_id=",
    moviesapi: "https://moviesapi.club",

    // Tier 4: Additional backups
    embed2: "https://www.2embed.cc/embed",
    nontonGo: "https://www.NontonGo.win/embed",
    autoembed: "https://player.autoembed.cc/embed",
};
