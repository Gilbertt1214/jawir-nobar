export const API_HOSTS = [
    import.meta.env.VITE_API_BASE_URL || "/__vidlink",
].filter(Boolean);

export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_KEY =
    import.meta.env.VITE_TMDB_API_KEY || "9998d44e51ed7634a06c4198b289bfe4";

export const NEKOPOI_BASE = import.meta.env.VITE_NEKOPOI_PROXY || "/nekopoi";

export const ANIME_SCRAPER_URL =
    import.meta.env.VITE_ANIME_SCRAPER_URL || "https://www.sankavollerei.com";

export const STREAMING_PROVIDERS = {
    vidsrc: "https://vidsrc.xyz/embed",
    vidsrcpro: "https://vidsrc.pro/embed",
    vidlink: "https://vidlink.pro",
    vidsrcto: "https://vidsrc.to/embed",
    vidsrcme: "https://vidsrc.me/embed",
    vidsrcxyz: "https://vidsrc.xyz/embed",
    vidsrcpm: "https://vidsrc.pm/embed",
    embedsu: "https://embed.su/embed",
    superembed: "https://multiembed.mov/?video_id=",
    moviesapi: "https://moviesapi.club",
    embed2: "https://www.2embed.cc/embed",
    nontonGo: "https://www.NontonGo.win/embed",
    autoembed: "https://player.autoembed.cc/embed",
};
