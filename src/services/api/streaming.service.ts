// Streaming Provider Service

import { STREAMING_PROVIDERS } from "./constants";
import type { StreamingProvider } from "./types";
import type { NekoBoccStreamLink } from "nekobocc";

export class StreamingService {
    private providerCache: Map<string, boolean> = new Map();

    // Check provider availability with better timeout handling
    private async checkProviderAvailability(url: string): Promise<boolean> {
        const cacheKey = url;
        if (this.providerCache.has(cacheKey)) {
            return this.providerCache.get(cacheKey)!;
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);

            await fetch(url, {
                method: "HEAD",
                mode: "no-cors",
                signal: controller.signal,
            });

            clearTimeout(timeout);
            this.providerCache.set(cacheKey, true);
            return true;
        } catch (error) {
            this.providerCache.set(cacheKey, false);
            return false;
        }
    }

    // Convert NekoBocc stream links to StreamingProvider format
    convertNekoBoccStreams(
        streamLinks: NekoBoccStreamLink[]
    ): StreamingProvider[] {
        return streamLinks.map((stream, index) => ({
            name: stream.server || `Server ${index + 1}`,
            url: stream.link,
            available: true,
            quality: stream.quality || "HD",
            language: "Japanese",
            tier: this.getServerTier(stream.server),
            priority: index + 1,
        }));
    }

    // Determine tier based on server name
    private getServerTier(serverName: string): number {
        const lowerServer = serverName.toLowerCase();

        // Tier 1: Premium servers (fast, reliable)
        if (
            lowerServer.includes("fembed") ||
            lowerServer.includes("streamtape")
        ) {
            return 1;
        }

        // Tier 2: Good quality servers
        if (
            lowerServer.includes("mp4upload") ||
            lowerServer.includes("mixdrop")
        ) {
            return 2;
        }

        // Tier 3: Standard servers
        if (
            lowerServer.includes("doodstream") ||
            lowerServer.includes("streamlare")
        ) {
            return 3;
        }

        // Tier 4: Backup servers
        return 4;
    }

    // Get streaming URLs with tiered provider system (for Movies & Series)
    async getStreamingUrls(
        movieId: string,
        type: "movie" | "series" = "movie"
    ): Promise<StreamingProvider[]> {
        const mediaType = type === "series" ? "tv" : "movie";

        // Ordered by reliability - using providers that actually work
        const baseProviders = [
            // Tier 1: Most reliable (tested working 2024)
            {
                name: "VidSrc.to",
                url: `https://vidsrc.to/embed/${mediaType}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 1,
            },
            {
                name: "VidSrc.me",
                url: `https://vidsrc.me/embed/${mediaType}/?tmdb=${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 2,
            },
            {
                name: "Embed.su",
                url: `https://embed.su/embed/${mediaType}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 3,
            },

            // Tier 2: Good quality
            {
                name: "SuperEmbed",
                url: `https://multiembed.mov/?video_id=${movieId}&tmdb=1`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 4,
            },
            {
                name: "2Embed",
                url: `https://www.2embed.cc/embed${
                    mediaType === "movie" ? "" : "tv"
                }/${movieId}`,
                quality: "HD",
                language: "English",
                tier: 2,
                priority: 5,
            },
            {
                name: "AutoEmbed",
                url: `https://player.autoembed.cc/embed/${mediaType}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 6,
            },

            // Tier 3: Backup
            {
                name: "VidSrc.xyz",
                url: `https://vidsrc.xyz/embed/${mediaType}?tmdb=${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 7,
            },
            {
                name: "MoviesAPI",
                url: `https://moviesapi.club/${mediaType}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 8,
            },
        ];

        // Skip availability check for faster loading - just return all providers
        // User can switch if one doesn't work
        return baseProviders.map((provider) => ({
            ...provider,
            available: true,
        }));
    }

    // Get episode streaming URLs with tiered providers (for TV Series)
    async getEpisodeStreamingUrl(
        seriesId: string,
        season: number,
        episode: number
    ): Promise<StreamingProvider[]> {
        // Using providers with correct URL formats for TV episodes
        // Ordered by reliability - using providers that actually work
        const providers = [
            // Tier 1 - Most reliable (tested working 2024)
            {
                name: "VidLink",
                url: `https://vidlink.pro/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 0, // Top priority
            },
            {
                name: "VidSrc.to",
                url: `https://vidsrc.to/embed/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 1,
            },
            {
                name: "VidSrc.me",
                url: `https://vidsrc.me/embed/tv/?tmdb=${seriesId}&season=${season}&episode=${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 2,
            },
            {
                name: "Embed.su",
                url: `https://embed.su/embed/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 1,
                priority: 3,
            },

            // Tier 2 - Good quality
            {
                name: "SuperEmbed",
                url: `https://multiembed.mov/?video_id=${seriesId}&tmdb=1&s=${season}&e=${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 4,
            },
            {
                name: "2Embed",
                url: `https://www.2embed.cc/embedtv/${seriesId}&s=${season}&e=${episode}`,
                quality: "HD",
                language: "English",
                tier: 2,
                priority: 5,
            },
            {
                name: "AutoEmbed",
                url: `https://player.autoembed.cc/embed/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 6,
            },

            // Tier 3 - Backup
            {
                name: "VidSrc.xyz",
                url: `https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${season}&episode=${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 7,
            },
            {
                name: "MoviesAPI",
                url: `https://moviesapi.club/tv/${seriesId}-${season}-${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 8,
            },
        ];

        // Skip availability check for faster loading - just return all providers
        // User can switch if one doesn't work
        return providers.map((provider) => ({
            ...provider,
            available: true,
        }));
    }

    // Get JAV/Hentai streaming providers from NekoBocc stream links
    async getJAVStreamingProviders(
        streamLinks: NekoBoccStreamLink[]
    ): Promise<StreamingProvider[]> {
        if (!streamLinks || streamLinks.length === 0) {
            return [];
        }

        return this.convertNekoBoccStreams(streamLinks);
    }

    // Utility methods
    clearProviderCache(): void {
        this.providerCache.clear();
    }

    getProviderStats(): { total: number; available: number } {
        const total = this.providerCache.size;
        const available = Array.from(this.providerCache.values()).filter(
            Boolean
        ).length;
        return { total, available };
    }

    getProviderTiers(): Record<number, string[]> {
        return {
            1: ["VidLink Pro", "VidSrc Pro"],
            2: ["VidSrc", "VidSrc XYZ", "VidSrc.me", "VidSrc PM"],
            3: ["Embed.su", "SuperEmbed", "MoviesAPI"],
            4: ["2Embed", "NontonGo"],
        };
    }

    // Get provider tiers for JAV/Hentai content (Nekopoi providers)
    getJAVProviderTiers(): Record<number, string[]> {
        return {
            1: ["Fembed", "StreamTape"],
            2: ["Mp4Upload", "MixDrop"],
            3: ["DoodStream", "StreamLare"],
            4: ["Other Servers"],
        };
    }
}
