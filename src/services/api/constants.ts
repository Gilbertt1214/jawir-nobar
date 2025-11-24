// API Configuration and Constants

export const API_HOSTS = [import.meta.env.VITE_API_BASE_URL || "/__vidlink"].filter(
    Boolean
);

export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_KEY =
    import.meta.env.VITE_TMDB_API_KEY || "9998d44e51ed7634a06c4198b289bfe4";

export const NEKOPOI_BASE = import.meta.env.VITE_NEKOPOI_PROXY || "/nekopoi";

export const NEKOBOCC_BASE = import.meta.env.VITE_NEKOBOCC_PROXY || "/nekobocc";

// Premium streaming providers (prioritized by quality and reliability)
export const STREAMING_PROVIDERS = {
    // Tier 1: Premium providers (no ads, HD quality)
    vidlink: "https://vidlink.pro/embed",
    vidsrcpro: "https://vidsrc.pro/embed",

    // Tier 2: High quality providers
    vidsrc: "https://vidsrc.to/embed",
    vidsrcxyz: "https://vidsrc.xyz/embed",
    vidsrcme: "https://vidsrc.me/embed",
    vidsrcpm: "https://vidsrc.pm/embed",

    // Tier 3: Reliable backup providers
    embedsu: "https://embed.su/embed",
    superembed: "https://multiembed.mov",
    moviesapi: "https://moviesapi.club/embed",

    // Tier 4: Additional backups
    embed2: "https://www.2embed.cc/embed",
    nontonGo: "https://www.NontonGo.win/embed",
};
