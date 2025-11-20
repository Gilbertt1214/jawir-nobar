const API_HOSTS = [
  import.meta.env.VITE_API_BASE_URL || '/__vidlink'
].filter(Boolean);

const VIDLINK_BASE = 'https://vidlink.pro';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

export interface Movie {
  id: string;
  title: string;
  cover: string;
  rating: number;
  genre: string[];
  country: string;
  year: string;
  synopsis: string;
  trailer?: string;
  type: 'movie' | 'series';
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  cover: string;
  streamUrl: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

class MovieAPI {
  private hosts: string[];
  private genreMap?: Record<string, { movie?: number; tv?: number }>;

  constructor() {
    this.hosts = (API_HOSTS.length ? API_HOSTS : ['https://vidlink.pro']);
  }

  private async fetchWithFallback(endpoint: string, options?: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let lastError: unknown = null;
    for (const host of this.hosts) {
      try {
        const url = endpoint.startsWith('http') ? endpoint : `${host}${endpoint}`;
        const res = await fetch(url, { ...options, mode: 'cors', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Non-JSON response');
        const json = await res.json();
        clearTimeout(timeout);
        return json;
      } catch (error) {
        lastError = error;
        console.warn('API host failed, trying next...', error);
      }
    }
    clearTimeout(timeout);
    if (import.meta.env.DEV) {
      return this.offlineResponse(endpoint);
    }
    throw (lastError instanceof Error ? lastError : new Error('All API hosts failed'));
  }

  private offlineResponse(endpoint: string) {
    const sample = (type: 'movie' | 'series') => ([
      { id: '786892', title: 'Furiosa: A Mad Max Saga', cover: '/placeholder.svg', rating: 8.1, genre: ['Action'], country: 'USA', year: '2024', synopsis: 'Sample synopsis', type },
      { id: '76479', title: 'The Boys', cover: '/placeholder.svg', rating: 8.4, genre: ['Drama'], country: 'USA', year: '2023', synopsis: 'Sample synopsis', type },
      { id: '615656', title: 'Meg 2: The Trench', cover: '/placeholder.svg', rating: 7.0, genre: ['Adventure'], country: 'USA', year: '2023', synopsis: 'Sample synopsis', type },
    ]);

    if (endpoint.startsWith('/genres')) return ['Action', 'Drama', 'Comedy'];
    if (endpoint.startsWith('/countries')) return ['USA', 'Japan', 'Korea'];
    if (endpoint.startsWith('/years')) return ['2025', '2024', '2023'];

    const isSeries = endpoint.startsWith('/series');
    const isSearch = endpoint.startsWith('/search/');
    const isMovieDetail = /^\/movies\//.test(endpoint);
    const isSeriesDetail = /^\/series\//.test(endpoint) && !/streams/.test(endpoint);
    const data = sample(isSeries ? 'series' : 'movie');

    if (isMovieDetail) {
      const id = endpoint.split('/movies/')[1];
      return data.find(d => d.id === id) || data[0];
    }
    if (isSeriesDetail) {
      const id = endpoint.split('/series/')[1];
      return data.find(d => d.id === id) || data[1];
    }
    if (isSearch) {
      const q = decodeURIComponent(endpoint.split('/search/')[1] || '').split('?')[0];
      const filtered = data.filter(d => d.title.toLowerCase().includes(q.toLowerCase()));
      return { data: filtered, page: 1, totalPages: 1, totalItems: filtered.length };
    }

    return { data, page: 1, totalPages: 1, totalItems: data.length };
  }

  private async ensureGenreMap() {
    if (this.genreMap) return;
    const m = await this.fetchWithFallback(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`);
    const t = await this.fetchWithFallback(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}`);
    const map: Record<string, { movie?: number; tv?: number }> = {};
    for (const g of (m.genres || [])) map[g.name] = { ...(map[g.name]||{}), movie: g.id };
    for (const g of (t.genres || [])) map[g.name] = { ...(map[g.name]||{}), tv: g.id };
    this.genreMap = map;
  }

  async getLatestMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    const r = await this.fetchWithFallback(`${TMDB_BASE}/movie/now_playing?page=${page}&api_key=${TMDB_KEY}`);
    const data: Movie[] = (r.results || []).map((m: any) => ({
      id: String(m.id),
      title: m.title,
      cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
      rating: m.vote_average || 0,
      genre: [],
      country: (m.origin_country && m.origin_country[0]) || '',
      year: (m.release_date || '').slice(0, 4),
      synopsis: m.overview || '',
      type: 'movie',
    }));
    return { data, page: r.page, totalPages: r.total_pages, totalItems: r.total_results };
  }

  async getPopularMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    const pagesToFetch = 5;
    const data: Movie[] = [];
    for (let p = page; p < page + pagesToFetch; p++) {
      const r = await this.fetchWithFallback(`${TMDB_BASE}/movie/popular?page=${p}&api_key=${TMDB_KEY}`);
      data.push(...(r.results || []).map((m: any) => ({
        id: String(m.id),
        title: m.title,
        cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
        rating: m.vote_average || 0,
        genre: [],
        country: (m.origin_country && m.origin_country[0]) || '',
        year: (m.release_date || '').slice(0, 4),
        synopsis: m.overview || '',
        type: 'movie',
      })));
    }
    return { data, page, totalPages: 1, totalItems: data.length };
  }

  async getLatestSeries(page = 1): Promise<PaginatedResponse<Movie>> {
    const r = await this.fetchWithFallback(`${TMDB_BASE}/tv/on_the_air?page=${page}&api_key=${TMDB_KEY}`);
    const data: Movie[] = (r.results || []).map((t: any) => ({
      id: String(t.id),
      title: t.name,
      cover: t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : '',
      rating: t.vote_average || 0,
      genre: [],
      country: (t.origin_country && t.origin_country[0]) || '',
      year: (t.first_air_date || '').slice(0, 4),
      synopsis: t.overview || '',
      type: 'series',
    }));
    return { data, page: r.page, totalPages: r.total_pages, totalItems: r.total_results };
  }

  async getMovieById(id: string): Promise<Movie> {
    const m = await this.fetchWithFallback(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}`);
    return {
      id: String(m.id),
      title: m.title,
      cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
      rating: m.vote_average || 0,
      genre: (m.genres || []).map((g: any) => g.name),
      country: ((m.production_countries || [])[0]?.name) || '',
      year: (m.release_date || '').slice(0, 4),
      synopsis: m.overview || '',
      type: 'movie',
    };
  }

  async getSeriesById(id: string): Promise<Movie> {
    const s = await this.fetchWithFallback(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}`);
    return {
      id: String(s.id),
      title: s.name,
      cover: s.poster_path ? `https://image.tmdb.org/t/p/w780${s.poster_path}` : '',
      rating: s.vote_average || 0,
      genre: (s.genres || []).map((g: any) => g.name),
      country: (s.origin_country && s.origin_country[0]) || '',
      year: (s.first_air_date || '').slice(0, 4),
      synopsis: s.overview || '',
      type: 'series',
    };
  }

  async getEpisodes(seriesId: string): Promise<Episode[]> {
    const season = 1;
    const r = await this.fetchWithFallback(`${TMDB_BASE}/tv/${seriesId}/season/${season}?api_key=${TMDB_KEY}`);
    const eps: Episode[] = (r.episodes || []).map((e: any) => ({
      id: String(e.id),
      title: e.name,
      episodeNumber: e.episode_number,
      seasonNumber: season,
      cover: e.still_path ? `https://image.tmdb.org/t/p/w780${e.still_path}` : '',
      streamUrl: `${VIDLINK_BASE}/tv/${seriesId}/${season}/${e.episode_number}?player=jw`,
    }));
    return eps;
  }

  async getEpisodeById(seriesId: string, episodeId: string): Promise<Episode> {
    const season = 1;
    const streamUrl = `${VIDLINK_BASE}/tv/${seriesId}/${season}/${episodeId}?player=jw`;
    return {
      id: `${seriesId}-e${episodeId}`,
      title: `Episode ${episodeId}`,
      episodeNumber: Number(episodeId),
      seasonNumber: season,
      cover: '/placeholder.svg',
      streamUrl,
    };
  }

  async searchMovies(query: string, page = 1): Promise<PaginatedResponse<Movie>> {
    const r = await this.fetchWithFallback(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&page=${page}&api_key=${TMDB_KEY}`);
    const data: Movie[] = (r.results || []).map((item: any) => ({
      id: String(item.id),
      title: item.title || item.name,
      cover: item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : '',
      rating: item.vote_average || 0,
      genre: [],
      country: (item.origin_country && item.origin_country[0]) || '',
      year: (item.release_date || item.first_air_date || '').slice(0, 4),
      synopsis: item.overview || '',
      type: item.media_type === 'tv' ? 'series' : 'movie',
    }));
    return { data, page: r.page || 1, totalPages: r.total_pages || 1, totalItems: r.total_results || data.length };
  }

  async getMoviesByGenre(genre: string, page = 1): Promise<PaginatedResponse<Movie>> {
    await this.ensureGenreMap();
    const key = Object.keys(this.genreMap || {}).find(k => k.toLowerCase() === genre.toLowerCase());
    const ids = key ? (this.genreMap as any)[key] : {};
    const out: Movie[] = [];
    if (ids.movie) {
      const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?with_genres=${ids.movie}&page=${page}&api_key=${TMDB_KEY}`);
      out.push(...(r.results||[]).map((m:any)=>({
        id: String(m.id),
        title: m.title,
        cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
        rating: m.vote_average || 0,
        genre: [genre],
        country: (m.origin_country && m.origin_country[0]) || '',
        year: (m.release_date||'').slice(0,4),
        synopsis: m.overview||'',
        type: 'movie',
      })));
    }
    if (ids.tv) {
      const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?with_genres=${ids.tv}&page=${page}&api_key=${TMDB_KEY}`);
      out.push(...(r.results||[]).map((t:any)=>({
        id: String(t.id),
        title: t.name,
        cover: t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : '',
        rating: t.vote_average || 0,
        genre: [genre],
        country: (t.origin_country && t.origin_country[0]) || '',
        year: (t.first_air_date||'').slice(0,4),
        synopsis: t.overview||'',
        type: 'series',
      })));
    }
    return { data: out, page, totalPages: 1, totalItems: out.length };
  }

  async getMoviesByCountry(country: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/countries/${encodeURIComponent(country)}?page=${page}`);
  }

  async getMoviesByYear(year: string, page = 1): Promise<PaginatedResponse<Movie>> {
    return this.fetchWithFallback(`/years/${year}?page=${page}`);
  }

  async getAllGenres(): Promise<string[]> {
    await this.ensureGenreMap();
    return Object.keys(this.genreMap || {});
  }

  async getAllCountries(): Promise<string[]> {
    return this.fetchWithFallback('/countries');
  }

  async getYears(): Promise<string[]> {
    return this.fetchWithFallback('/years');
  }

  async getAnime(page = 1): Promise<PaginatedResponse<Movie>> {
    await this.ensureGenreMap();
    const animation = (this.genreMap || {})['Animation'];
    const results: Movie[] = [];
    const pagesToFetch = 5;
    if (animation?.tv) {
      for (let p = page; p < page + pagesToFetch; p++) {
        const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?with_genres=${animation.tv}&with_origin_country=JP&page=${p}&api_key=${TMDB_KEY}`);
        results.push(...(r.results || []).map((t: any) => ({
          id: String(t.id),
          title: t.name,
          cover: t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : '',
          rating: t.vote_average || 0,
          genre: ['Animation'],
          country: (t.origin_country && t.origin_country[0]) || 'JP',
          year: (t.first_air_date || '').slice(0, 4),
          synopsis: t.overview || '',
          type: 'series',
        })));
      }
    }
    if (animation?.movie) {
      for (let p = page; p < page + pagesToFetch; p++) {
        const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?with_genres=${animation.movie}&with_origin_country=JP&page=${p}&api_key=${TMDB_KEY}`);
        results.push(...(r.results || []).map((m: any) => ({
          id: String(m.id),
          title: m.title,
          cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
          rating: m.vote_average || 0,
          genre: ['Animation'],
          country: (m.origin_country && m.origin_country[0]) || 'JP',
          year: (m.release_date || '').slice(0, 4),
          synopsis: m.overview || '',
          type: 'movie',
        })));
      }
    }
    return { data: results, page, totalPages: 1, totalItems: results.length };
  }

  async getIndonesianMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?with_origin_country=ID&page=${page}&api_key=${TMDB_KEY}`);
    const data: Movie[] = (r.results || []).map((m: any) => ({
      id: String(m.id),
      title: m.title,
      cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
      rating: m.vote_average || 0,
      genre: [],
      country: 'Indonesia',
      year: (m.release_date || '').slice(0, 4),
      synopsis: m.overview || '',
      type: 'movie',
    }));
    return { data, page: r.page || page, totalPages: r.total_pages || 1, totalItems: r.total_results || data.length };
  }
  async getKoreanDrama(page = 1): Promise<PaginatedResponse<Movie>> {
    await this.ensureGenreMap();
    const drama = (this.genreMap || {})['Drama'];
    const results: Movie[] = [];
    if (drama?.tv) {
      const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?with_genres=${drama.tv}&with_origin_country=KR&page=${page}&api_key=${TMDB_KEY}`);
      results.push(...(r.results || []).map((t: any) => ({
        id: String(t.id),
        title: t.name,
        cover: t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : '',
        rating: t.vote_average || 0,
        genre: ['Drama'],
        country: 'Korea',
        year: (t.first_air_date || '').slice(0, 4),
        synopsis: t.overview || '',
        type: 'series',
      })));
    }
    return { data: results, page, totalPages: 1, totalItems: results.length };
  }
}

export const movieAPI = new MovieAPI();
