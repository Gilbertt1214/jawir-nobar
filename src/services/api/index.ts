// Main API Export - Unified MovieAPI Interface

import { TMDBService } from "./tmdb.service";
import { NekopoiService } from "./nekopoi.service";
import { NekopoiCareService } from "./nekopoi-care.service";
import { NekoBoccService } from "./nekobocc.service";
import { StreamingService } from "./streaming.service";
import { AnimeService } from "./anime.service";
import { NEKOPOI_BASE } from "./constants";
import type {
    Movie,
    Episode,
    PaginatedResponse,
    StreamingProvider,
    AnimeDetail,
    NekoBoccHentai,
    NekopoiHentai,
} from "./types";

// Export all types
export * from "./types";

class MovieAPI {
    private tmdb: TMDBService;
    private nekopoi: NekopoiService;
    private nekopoiCare: NekopoiCareService;
    private nekobocc: NekoBoccService;
    private streaming: StreamingService;
    private anime: AnimeService;

    constructor() {
        this.tmdb = new TMDBService();
        this.nekopoi = new NekopoiService();
        this.nekopoiCare = new NekopoiCareService();
        this.nekobocc = new NekoBoccService();
        this.streaming = new StreamingService();
        this.anime = new AnimeService();
    }

    // TMDB Methods
    async getLatestMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getLatestMovies(page);
    }

    async getLatestSeries(page = 1): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getLatestSeries(page);
    }

    async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getPopularMovies(page);
    }

    async getMovieById(id: string): Promise<Movie> {
        return this.tmdb.getMovieById(id);
    }

    async getSeriesById(id: string): Promise<Movie> {
        return this.tmdb.getSeriesById(id);
    }

    async getEpisodes(seriesId: string): Promise<Episode[]> {
        return this.tmdb.getEpisodes(seriesId);
    }

    async getEpisodeById(
        seriesId: string,
        episodeId: string
    ): Promise<Episode> {
        const episode = await this.tmdb.getEpisodeById(seriesId, episodeId);

        // Get streaming URLs for the episode
        const parts = String(episodeId).split("-");
        const season = Number(parts[0] || 1);
        const ep = Number(parts[1] || episodeId);

        const providers = await this.streaming.getEpisodeStreamingUrl(
            seriesId,
            season,
            ep
        );

        return {
            ...episode,
            streamUrl: providers[0]?.url || "#",
        };
    }

    async searchMovies(
        query: string,
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.searchMovies(query, page);
    }

    async getMoviesByGenre(
        genre: string,
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getMoviesByGenre(genre, page);
    }

    async getMoviesByCountry(
        country: string,
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getMoviesByCountry(country, page);
    }

    async getMoviesByYear(
        year: string,
        page = 1
    ): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getMoviesByYear(year, page);
    }

    async getAllGenres(): Promise<string[]> {
        return this.tmdb.getAllGenres();
    }

    async getAllCountries(): Promise<string[]> {
        return this.tmdb.getAllCountries();
    }

    async getYears(): Promise<string[]> {
        return this.tmdb.getYears();
    }

    async getAnime(
        page = 1,
        opts?: { type?: "tv" | "movie" | "all"; audio?: "sub" | "dub" | "all" }
    ): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getAnime(page, opts);
    }

    // Anime Scraper Methods (from AnimeService)
    async getOngoingAnime(): Promise<Movie[]> {
        return this.anime.getOngoingAnime();
    }

    async getAnimeScraperDetail(slug: string): Promise<AnimeDetail | null> {
        return this.anime.getAnimeDetail(slug);
    }

    async getAnimeStreamLinks(slug: string) {
        return this.anime.getStreamLinks(slug);
    }

    async searchAnime(query: string): Promise<Movie[]> {
        return this.anime.searchAnime(query);
    }

    async getAdultMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getAdultMovies(page);
    }

    async getIndonesianMovies(page = 1): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getIndonesianMovies(page);
    }

    async getKoreanDrama(page = 1): Promise<PaginatedResponse<Movie>> {
        return this.tmdb.getKoreanDrama(page);
    }

    // Streaming Methods
    async getStreamingUrls(
        movieId: string,
        type: "movie" | "series" = "movie"
    ): Promise<StreamingProvider[]> {
        return this.streaming.getStreamingUrls(movieId, type);
    }

    async getEpisodeStreamingUrl(
        seriesId: string,
        season: number,
        episode: number
    ): Promise<StreamingProvider[]> {
        return this.streaming.getEpisodeStreamingUrl(seriesId, season, episode);
    }

    // Get JAV/Hentai streaming providers from NekoBocc
    async getJAVStreamingProviders(
        streamLinks: any[]
    ): Promise<StreamingProvider[]> {
        return this.streaming.getJAVStreamingProviders(streamLinks);
    }

    // Nekopoi Methods
    async getNekopoiLatest(
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        return this.nekopoi.getLatest(page);
    }

    async getNekopoiDetail(url: string): Promise<NekopoiHentai | null> {
        return this.nekopoi.getDetail(url);
    }

    async searchNekopoi(query: string): Promise<NekopoiHentai[]> {
        return this.nekopoi.search(query);
    }

    async getNekopoiByGenre(
        genre: string,
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        return this.nekopoi.getByGenre(genre, page);
    }

    // Nekopoi.care Methods (Direct Website)
    async getNekopoiCareLatest(
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        return this.nekopoiCare.getLatest(page);
    }

    async getNekopoiCareDetail(slug: string): Promise<NekopoiHentai | null> {
        return this.nekopoiCare.getDetail(slug);
    }

    async searchNekopoiCare(query: string): Promise<NekopoiHentai[]> {
        return this.nekopoiCare.search(query);
    }

    async getNekopoiCareByCategory(
        category: string,
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        return this.nekopoiCare.getByCategory(category, page);
    }

    async getNekopoiCareCategories(): Promise<string[]> {
        return this.nekopoiCare.getCategories();
    }

    // NekoBocc Methods
    async getNekoBoccReleaseList(
        page: number = 1
    ): Promise<PaginatedResponse<NekoBoccHentai>> {
        return this.nekobocc.getReleaseList(page);
    }

    async getNekoBoccDetail(slug: string): Promise<NekoBoccHentai | null> {
        return this.nekobocc.getDetail(slug);
    }

    async searchNekoBocc(query: string): Promise<NekoBoccHentai[]> {
        return this.nekobocc.search(query);
    }

    async getNekoBoccRandom(): Promise<NekoBoccHentai | null> {
        return this.nekobocc.getRandom();
    }

    async getNekoBoccHentaiList(
        page: number = 1
    ): Promise<PaginatedResponse<NekoBoccHentai>> {
        return this.nekobocc.getHentaiList(page);
    }

    // Combined Methods
    async getAllHentaiLatest(page: number = 1): Promise<{
        nekopoi: PaginatedResponse<NekopoiHentai>;
        nekopoiCare: PaginatedResponse<NekopoiHentai>;
        nekobocc: PaginatedResponse<NekoBoccHentai>;
    }> {
        // Fetch each source independently to avoid one failure affecting others
        const emptyResponse = {
            data: [],
            page: 1,
            totalPages: 1,
            totalItems: 0,
        };

        // Use NekoBocc (mock data) as primary source since external APIs may be blocked
        const nekoboccData = await this.nekobocc.getReleaseList(page);

        // Try to fetch from other sources but don't wait too long
        const [nekopoiData, nekopoiCareData] = await Promise.allSettled([
            Promise.race([
                this.nekopoi.getLatest(page),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 3000)
                ),
            ]),
            Promise.race([
                this.nekopoiCare.getLatest(page),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 3000)
                ),
            ]),
        ]);

        return {
            nekopoi:
                nekopoiData.status === "fulfilled"
                    ? (nekopoiData.value as PaginatedResponse<NekopoiHentai>)
                    : emptyResponse,
            nekopoiCare:
                nekopoiCareData.status === "fulfilled"
                    ? (nekopoiCareData.value as PaginatedResponse<NekopoiHentai>)
                    : emptyResponse,
            nekobocc: nekoboccData,
        };
    }

    async searchAllHentai(query: string): Promise<{
        nekopoi: NekopoiHentai[];
        nekopoiCare: NekopoiHentai[];
        nekobocc: NekoBoccHentai[];
    }> {
        // Fetch each source independently
        const [nekopoiResults, nekopoiCareResults, nekoboccResults] =
            await Promise.allSettled([
                this.nekopoi.search(query),
                this.nekopoiCare.search(query),
                this.nekobocc.search(query),
            ]);

        return {
            nekopoi:
                nekopoiResults.status === "fulfilled"
                    ? nekopoiResults.value
                    : [],
            nekopoiCare:
                nekopoiCareResults.status === "fulfilled"
                    ? nekopoiCareResults.value
                    : [],
            nekobocc:
                nekoboccResults.status === "fulfilled"
                    ? nekoboccResults.value
                    : [],
        };
    }

    // Utility Methods
    clearProviderCache(): void {
        this.streaming.clearProviderCache();
    }

    getProviderStats(): { total: number; available: number } {
        return this.streaming.getProviderStats();
    }

    getProviderTiers(): Record<number, string[]> {
        return this.streaming.getProviderTiers();
    }

    async getAPIStatus(): Promise<{
        nekopoi: boolean;
        nekobocc: boolean;
        tmdb: boolean;
    }> {
        try {
            const [nekopoiStatus, nekoboccStatus, tmdbStatus] =
                await Promise.all([
                    fetch(`${NEKOPOI_BASE}/latest`)
                        .then((res) => res.ok)
                        .catch(() => false),
                    this.nekobocc
                        .getReleaseList(1)
                        .then(() => true)
                        .catch(() => false),
                    this.tmdb
                        .getPopularMovies(1)
                        .then(() => true)
                        .catch(() => false),
                ]);

            return {
                nekopoi: nekopoiStatus,
                nekobocc: nekoboccStatus,
                tmdb: tmdbStatus,
            };
        } catch (error) {
            console.error("Failed to get API status:", error);
            return {
                nekopoi: false,
                nekobocc: false,
                tmdb: false,
            };
        }
    }
}

export const movieAPI = new MovieAPI();
