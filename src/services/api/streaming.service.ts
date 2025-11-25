// Streaming Provider Service

import { STREAMING_PROVIDERS } from "./constants";
import type { StreamingProvider } from "./types";

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

    // Get streaming URLs with tiered provider system
    async getStreamingUrls(
        movieId: string,
        type: "movie" | "series" = "movie"
    ): Promise<StreamingProvider[]> {
        const baseProviders = [
            // Tier 1: Premium (highest priority)
            {
                name: "VidLink Pro",
                url: `${STREAMING_PROVIDERS.vidlink}/${type}/${movieId}`,
                quality: "4K/HD",
                language: "Multi",
                tier: 1,
                priority: 1,
            },
            {
                name: "VidSrc Pro",
                url: `${STREAMING_PROVIDERS.vidsrcpro}/${type}/${movieId}`,
                quality: "4K/HD",
                language: "Multi",
                tier: 1,
                priority: 2,
            },

            // Tier 2: High Quality
            {
                name: "VidSrc",
                url: `${STREAMING_PROVIDERS.vidsrc}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 3,
            },
            {
                name: "VidSrc XYZ",
                url: `${STREAMING_PROVIDERS.vidsrcxyz}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 4,
            },
            {
                name: "VidSrc.me",
                url: `${STREAMING_PROVIDERS.vidsrcme}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 5,
            },
            {
                name: "VidSrc PM",
                url: `${STREAMING_PROVIDERS.vidsrcpm}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 6,
            },

            // Tier 3: Reliable Backups
            {
                name: "Embed.su",
                url: `${STREAMING_PROVIDERS.embedsu}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 7,
            },
            {
                name: "SuperEmbed",
                url: `${STREAMING_PROVIDERS.superembed}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 8,
            },
            {
                name: "MoviesAPI",
                url: `${STREAMING_PROVIDERS.moviesapi}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 9,
            },

            // Tier 4: Additional Backups
            {
                name: "2Embed",
                url: `${STREAMING_PROVIDERS.embed2}/${
                    type === "movie" ? "" : "tv/"
                }${movieId}`,
                quality: "HD",
                language: "English",
                tier: 4,
                priority: 10,
            },
            {
                name: "NontonGo",
                url: `${STREAMING_PROVIDERS.nontonGo}/${type}/${movieId}`,
                quality: "HD",
                language: "Multi",
                tier: 4,
                priority: 11,
            },
        ];

        const availabilityChecks = baseProviders.map(async (provider) => {
            const available = await this.checkProviderAvailability(
                provider.url
            );
            return {
                name: provider.name,
                url: provider.url,
                available,
                quality: provider.quality,
                language: provider.language,
                tier: provider.tier,
                priority: provider.priority,
            };
        });

        const results = await Promise.all(availabilityChecks);

        return results
            .filter((provider) => provider.available)
            .sort((a, b) => (a as any).priority - (b as any).priority);
    }

    // Get episode streaming URLs with tiered providers
    async getEpisodeStreamingUrl(
        seriesId: string,
        season: number,
        episode: number
    ): Promise<StreamingProvider[]> {
        const providers = [
            // Tier 1
            {
                name: "VidLink Pro",
                url: `${STREAMING_PROVIDERS.vidlink}/tv/${seriesId}/${season}/${episode}`,
                quality: "4K/HD",
                language: "Multi",
                tier: 1,
                priority: 1,
            },
            {
                name: "VidSrc Pro",
                url: `${STREAMING_PROVIDERS.vidsrcpro}/tv/${seriesId}/${season}/${episode}`,
                quality: "4K/HD",
                language: "Multi",
                tier: 1,
                priority: 2,
            },

            // Tier 2
            {
                name: "VidSrc",
                url: `${STREAMING_PROVIDERS.vidsrc}/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 3,
            },
            {
                name: "VidSrc XYZ",
                url: `${STREAMING_PROVIDERS.vidsrcxyz}/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 4,
            },
            {
                name: "VidSrc PM",
                url: `${STREAMING_PROVIDERS.vidsrcpm}/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 2,
                priority: 5,
            },

            // Tier 3
            {
                name: "Embed.su",
                url: `${STREAMING_PROVIDERS.embedsu}/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 6,
            },
            {
                name: "SuperEmbed",
                url: `${STREAMING_PROVIDERS.superembed}/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "Multi",
                tier: 3,
                priority: 7,
            },
            {
                name: "2Embed",
                url: `${STREAMING_PROVIDERS.embed2}/tv/${seriesId}/${season}/${episode}`,
                quality: "HD",
                language: "English",
                tier: 4,
                priority: 8,
            },
             {
                name: "NontonGo",
                url: `${STREAMING_PROVIDERS.nontonGo}/${seriesId}/${season}`,
                quality: "HD",
                language: "Multi",
                tier: 4,
                priority: 11,
            },
        
        ];

        const availabilityChecks = providers.map(async (provider) => {
            const available = await this.checkProviderAvailability(
                provider.url
            );
            return {
                ...provider,
                available,
            };
        });

        const results = await Promise.all(availabilityChecks);

        return results
            .filter((provider) => provider.available)
            .sort((a, b) => (a as any).priority - (b as any).priority);
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
}
