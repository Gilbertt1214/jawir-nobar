// Main API Export - Unified MovieAPI Interface

import { TMDBService } from "./tmdb.service";
import { NekopoiService } from "./nekopoi.service";
import { StreamingService } from "./streaming.service";
import { AnimeService } from "./anime.service";
import { sankaNekopoiService } from "./sanka-nekopoi.service";
import type {
    Movie,
    Episode,
    PaginatedResponse,
    StreamingProvider,
    AnimeDetail,
    NekopoiHentai,
} from "./types";

// Export all types
export * from "./types";

class MovieAPI {
    private tmdb: TMDBService;
    private nekopoi: NekopoiService;
    private streaming: StreamingService;
    private anime: AnimeService;

    constructor() {
        this.tmdb = new TMDBService();
        this.nekopoi = new NekopoiService();
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

    // Anime Methods (Jikan + Wajik/Otakudesu)
    async getOngoingAnime(): Promise<Movie[]> {
        return this.anime.getOngoingAnime();
    }

    async getAnimeDetail(id: string): Promise<AnimeDetail | null> {
        return this.anime.getAnimeDetail(id);
    }

    // Get anime detail - uses Otakudesu API as primary
    async getAnimeScraperDetail(slug: string): Promise<AnimeDetail | null> {
        // Try Otakudesu API first (primary source)
        const otakudesuDetail = await this.anime.getAnimeDetailOtakudesu(slug);
        if (otakudesuDetail) return otakudesuDetail;

        // Fallback to Jikan if numeric ID
        if (/^\d+$/.test(slug)) {
            return this.anime.getAnimeDetail(slug);
        }

        return null;
    }

    // Get episode stream from Otakudesu API
    async getAnimeEpisodeStreamOtakudesu(episodeSlug: string) {
        return this.anime.getEpisodeStreamOtakudesu(episodeSlug);
    }

    async searchAnime(query: string): Promise<Movie[]> {
        return this.anime.searchAnime(query);
    }

    async getOngoingAnimeList(): Promise<Movie[]> {
        return this.anime.getOngoingAnime();
    }

    // Otakudesu specific methods (Indonesian sub)
    async searchAnimeOtakudesu(query: string): Promise<Movie[]> {
        return this.anime.searchAnimeOtakudesu(query);
    }

    async getAnimeDetailOtakudesu(animeId: string) {
        return this.anime.getAnimeDetailOtakudesu(animeId);
    }

    async getAnimeEpisodeStream(episodeId: string) {
        return this.anime.getEpisodeStreamOtakudesu(episodeId);
    }

    // Get complete anime list
    async getCompleteAnime(page: number = 1) {
        return this.anime.getCompleteAnime(page);
    }

    // Get anime genres
    async getAnimeGenres() {
        return this.anime.getAnimeGenres();
    }

    // Get anime by genre
    async getAnimeByGenre(genreSlug: string, page: number = 1) {
        return this.anime.getAnimeByGenre(genreSlug, page);
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

    // Get JAV/Hentai streaming providers
    async getJAVStreamingProviders(
        streamLinks: any[]
    ): Promise<StreamingProvider[]> {
        return this.streaming.getJAVStreamingProviders(streamLinks);
    }

    // Nekopoi Methods (Sanka API - Primary)
    async getNekopoiLatest(
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        // Try Sanka API first
        const sankaResult = await sankaNekopoiService.getReleaseList(page);
        if (sankaResult.data.length > 0) return sankaResult;
        // Fallback to old API
        return this.nekopoi.getLatest(page);
    }

    async getNekopoiDetail(url: string): Promise<NekopoiHentai | null> {
        // Try Sanka API first
        const sankaDetail = await sankaNekopoiService.getDetail(url);
        if (sankaDetail) return sankaDetail;
        // Fallback to old API
        return this.nekopoi.getDetail(url);
    }

    async searchNekopoi(query: string): Promise<NekopoiHentai[]> {
        // Try Sanka API first
        const sankaResults = await sankaNekopoiService.search(query);
        if (sankaResults.length > 0) return sankaResults;
        // Fallback to old API
        return this.nekopoi.search(query);
    }

    async getNekopoiByGenre(
        genre: string,
        page: number = 1
    ): Promise<PaginatedResponse<NekopoiHentai>> {
        return this.nekopoi.getByGenre(genre, page);
    }

    // Sanka Nekopoi specific methods
    async getSankaNekopoiLatest(): Promise<NekopoiHentai[]> {
        return sankaNekopoiService.getLatest();
    }

    async getSankaNekopoiRandom(): Promise<NekopoiHentai | null> {
        return sankaNekopoiService.getRandom();
    }

    // Combined Methods - Using Sanka Nekopoi as primary (only nekopoi source now)
    async getAllHentaiLatest(page: number = 1): Promise<{
        nekopoi: PaginatedResponse<NekopoiHentai>;
    }> {
        const emptyResponse = {
            data: [],
            page: 1,
            totalPages: 1,
            totalItems: 0,
        };

        // Try Sanka Nekopoi (primary source)
        const sankaData = await sankaNekopoiService
            .getReleaseList(page)
            .catch(() => emptyResponse);

        return {
            nekopoi: sankaData,
        };
    }

    async searchAllHentai(query: string): Promise<{
        nekopoi: NekopoiHentai[];
    }> {
        const sankaResults = await sankaNekopoiService
            .search(query)
            .catch(() => []);

        return {
            nekopoi: sankaResults,
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
        tmdb: boolean;
    }> {
        try {
            const [nekopoiStatus, tmdbStatus] = await Promise.all([
                sankaNekopoiService
                    .getLatest()
                    .then((data) => {
                        console.log(
                            "Nekopoi API status check - items:",
                            data.length
                        );
                        return data.length > 0;
                    })
                    .catch((err) => {
                        console.error("Nekopoi API status check failed:", err);
                        return false;
                    }),
                this.tmdb
                    .getPopularMovies(1)
                    .then(() => true)
                    .catch(() => false),
            ]);

            return {
                nekopoi: nekopoiStatus,
                tmdb: tmdbStatus,
            };
        } catch (error) {
            console.error("Failed to get API status:", error);
            return {
                nekopoi: false,
                tmdb: false,
            };
        }
    }

    // Anime Scraper Methods (sankavollerei.com)
    getAnimeStreamingProviders(
        animeSlug: string,
        episode: number
    ): StreamingProvider[] {
        return this.streaming.getAnimeStreamingProviders(animeSlug, episode);
    }

    getAnimeScraperUrl(): string {
        return this.streaming.getAnimeScraperUrl();
    }

    // Build anime stream URL
    buildAnimeStreamUrl(animeSlug: string, episode: number): string {
        const baseUrl = this.streaming.getAnimeScraperUrl();
        return `${baseUrl}/${animeSlug}/episode-${episode}`;
    }
}

export const movieAPI = new MovieAPI();
