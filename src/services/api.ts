const API_HOSTS = [
  import.meta.env.VITE_API_BASE_URL || '/__vidlink'
].filter(Boolean);

const VIDLINK_BASE = 'https://vidlink.pro';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

export interface PersonCast { id: string; name: string; character?: string; profile?: string }
export interface PersonCrew { id: string; name: string; job?: string; profile?: string }
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
  backdrops?: string[];
  cast?: PersonCast[];
  crew?: PersonCrew[];
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
  private countriesCache?: string[];

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
    const r = await this.fetchWithFallback(`${TMDB_BASE}/movie/popular?page=${page}&api_key=${TMDB_KEY}`);
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
    return { data, page: r.page || page, totalPages: r.total_pages || 1, totalItems: r.total_results || data.length };
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
    const m = await this.fetchWithFallback(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits,images`);
    const trailerKey = (m.videos?.results || []).find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key;
    const backdrops: string[] = (m.images?.backdrops || []).slice(0, 10).map((b: any) => b.file_path ? `https://image.tmdb.org/t/p/w1280${b.file_path}` : '').filter(Boolean);
    const cast = (m.credits?.cast || []).slice(0, 10).map((c: any) => ({ id: String(c.id), name: c.name, character: c.character, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '' }));
    const crew = (m.credits?.crew || []).slice(0, 10).map((c: any) => ({ id: String(c.id), name: c.name, job: c.job, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '' }));
    return {
      id: String(m.id),
      title: m.title,
      cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
      rating: m.vote_average || 0,
      genre: (m.genres || []).map((g: any) => g.name),
      country: ((m.production_countries || [])[0]?.name) || '',
      year: (m.release_date || '').slice(0, 4),
      synopsis: m.overview || '',
      trailer: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : undefined,
      backdrops,
      cast,
      crew,
      type: 'movie',
    };
  }

  async getSeriesById(id: string): Promise<Movie> {
    const s = await this.fetchWithFallback(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits,images`);
    const trailerKey = (s.videos?.results || []).find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key;
    const backdrops: string[] = (s.images?.backdrops || []).slice(0, 10).map((b: any) => b.file_path ? `https://image.tmdb.org/t/p/w1280${b.file_path}` : '').filter(Boolean);
    const cast = (s.credits?.cast || []).slice(0, 10).map((c: any) => ({ id: String(c.id), name: c.name, character: c.character, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '' }));
    const crew = (s.credits?.crew || []).slice(0, 10).map((c: any) => ({ id: String(c.id), name: c.name, job: c.job, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '' }));
    return {
      id: String(s.id),
      title: s.name,
      cover: s.poster_path ? `https://image.tmdb.org/t/p/w780${s.poster_path}` : '',
      rating: s.vote_average || 0,
      genre: (s.genres || []).map((g: any) => g.name),
      country: (s.origin_country && s.origin_country[0]) || '',
      year: (s.first_air_date || '').slice(0, 4),
      synopsis: s.overview || '',
      trailer: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : undefined,
      backdrops,
      cast,
      crew,
      type: 'series',
    };
  }

  async getEpisodes(seriesId: string): Promise<Episode[]> {
    const tv = await this.fetchWithFallback(`${TMDB_BASE}/tv/${seriesId}?api_key=${TMDB_KEY}`);
    const seasons = (tv.seasons || []).filter((s: any) => s.season_number > 0);
    const eps: Episode[] = [];
    for (const s of seasons) {
      const r = await this.fetchWithFallback(`${TMDB_BASE}/tv/${seriesId}/season/${s.season_number}?api_key=${TMDB_KEY}`);
      eps.push(...(r.episodes || []).map((e: any) => ({
        id: `${s.season_number}-${e.episode_number}`,
        title: e.name,
        episodeNumber: e.episode_number,
        seasonNumber: s.season_number,
        cover: e.still_path ? `https://image.tmdb.org/t/p/w780${e.still_path}` : '',
        streamUrl: `${VIDLINK_BASE}/tv/${seriesId}/${s.season_number}/${e.episode_number}?player=jw&icons=default&title=true&poster=true`,
      })));
    }
    return eps;
  }

  async getEpisodeById(seriesId: string, episodeId: string): Promise<Episode> {
    const parts = String(episodeId).split('-');
    const season = Number(parts[0] || 1);
    const ep = Number(parts[1] || episodeId);
    const d = await this.fetchWithFallback(`${TMDB_BASE}/tv/${seriesId}/season/${season}/episode/${ep}?api_key=${TMDB_KEY}`);
    const streamUrl = `${VIDLINK_BASE}/tv/${seriesId}/${season}/${ep}?player=jw&icons=default&title=true&poster=true`;
    return {
      id: `${season}-${ep}`,
      title: d.name || `Episode ${ep}`,
      episodeNumber: ep,
      seasonNumber: season,
      cover: d.still_path ? `https://image.tmdb.org/t/p/w780${d.still_path}` : '/placeholder.svg',
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
    const m = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?with_origin_country=${encodeURIComponent(country)}&page=${page}&api_key=${TMDB_KEY}`);
    const t = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?with_origin_country=${encodeURIComponent(country)}&page=${page}&api_key=${TMDB_KEY}`);
    const data: Movie[] = [
      ...(m.results || []).map((x: any) => ({ id: String(x.id), title: x.title, cover: x.poster_path ? `https://image.tmdb.org/t/p/w780${x.poster_path}` : '', rating: x.vote_average || 0, genre: [], country, year: (x.release_date || '').slice(0,4), synopsis: x.overview || '', type: 'movie' })),
      ...(t.results || []).map((x: any) => ({ id: String(x.id), title: x.name, cover: x.poster_path ? `https://image.tmdb.org/t/p/w780${x.poster_path}` : '', rating: x.vote_average || 0, genre: [], country, year: (x.first_air_date || '').slice(0,4), synopsis: x.overview || '', type: 'series' })),
    ];
    return { data, page, totalPages: Math.max(m.total_pages || 1, t.total_pages || 1), totalItems: data.length };
  }

  async getMoviesByYear(year: string, page = 1): Promise<PaginatedResponse<Movie>> {
    const m = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?primary_release_year=${encodeURIComponent(year)}&page=${page}&api_key=${TMDB_KEY}`);
    const t = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?first_air_date_year=${encodeURIComponent(year)}&page=${page}&api_key=${TMDB_KEY}`);
    const data: Movie[] = [
      ...(m.results || []).map((x: any) => ({ id: String(x.id), title: x.title, cover: x.poster_path ? `https://image.tmdb.org/t/p/w780${x.poster_path}` : '', rating: x.vote_average || 0, genre: [], country: (x.origin_country && x.origin_country[0]) || '', year: (x.release_date || '').slice(0,4), synopsis: x.overview || '', type: 'movie' })),
      ...(t.results || []).map((x: any) => ({ id: String(x.id), title: x.name, cover: x.poster_path ? `https://image.tmdb.org/t/p/w780${x.poster_path}` : '', rating: x.vote_average || 0, genre: [], country: (x.origin_country && x.origin_country[0]) || '', year: (x.first_air_date || '').slice(0,4), synopsis: x.overview || '', type: 'series' })),
    ];
    return { data, page, totalPages: Math.max(m.total_pages || 1, t.total_pages || 1), totalItems: data.length };
  }

  async getAllGenres(): Promise<string[]> {
    await this.ensureGenreMap();
    return Object.keys(this.genreMap || {});
  }

  async getAllCountries(): Promise<string[]> {
    if (this.countriesCache) return this.countriesCache;
    const popularMovies = await this.fetchWithFallback(`${TMDB_BASE}/movie/popular?page=1&api_key=${TMDB_KEY}`);
    const popularTv = await this.fetchWithFallback(`${TMDB_BASE}/tv/popular?page=1&api_key=${TMDB_KEY}`);
    const set = new Set<string>();
    for (const m of (popularMovies.results || [])) {
      if (Array.isArray(m.origin_country)) for (const c of m.origin_country) set.add(c);
    }
    for (const t of (popularTv.results || [])) {
      if (Array.isArray(t.origin_country)) for (const c of t.origin_country) set.add(c);
    }
    this.countriesCache = Array.from(set).sort();
    return this.countriesCache;
  }

  async getYears(): Promise<string[]> {
    const current = new Date().getFullYear();
    const start = 1970;
    const out: string[] = [];
    for (let y = current; y >= start; y--) out.push(String(y));
    return out;
  }

  async getAnime(page = 1, opts?: { type?: 'tv'|'movie'|'all'; audio?: 'sub'|'dub'|'all' }): Promise<PaginatedResponse<Movie>> {
    await this.ensureGenreMap();
    const animation = (this.genreMap || {})['Animation'];
    const results: Movie[] = [];
    const type = opts?.type || 'all';
    const audio = opts?.audio || 'all';
    const pagesToFetch = 5;
    const pushFiltered = (items: any[], map: (x: any) => Movie) => {
      for (const x of items) {
        const lang = x.original_language || 'ja';
        if (audio === 'sub' && lang !== 'ja') continue;
        if (audio === 'dub' && lang === 'ja') continue;
        results.push(map(x));
      }
    };
    if ((type === 'tv' || type === 'all') && animation?.tv) {
      for (let p = page; p < page + pagesToFetch; p++) {
        const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?with_genres=${animation.tv}&with_origin_country=JP&page=${p}&api_key=${TMDB_KEY}`);
        pushFiltered((r.results || []), (t: any) => ({ id: String(t.id), title: t.name, cover: t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : '', rating: t.vote_average || 0, genre: ['Animation'], country: (t.origin_country && t.origin_country[0]) || 'JP', year: (t.first_air_date || '').slice(0,4), synopsis: t.overview || '', type: 'series' }));
      }
    }
    if ((type === 'movie' || type === 'all') && animation?.movie) {
      for (let p = page; p < page + pagesToFetch; p++) {
        const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?with_genres=${animation.movie}&with_origin_country=JP&page=${p}&api_key=${TMDB_KEY}`);
        pushFiltered((r.results || []), (m: any) => ({ id: String(m.id), title: m.title, cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '', rating: m.vote_average || 0, genre: ['Animation'], country: (m.origin_country && m.origin_country[0]) || 'JP', year: (m.release_date || '').slice(0,4), synopsis: m.overview || '', type: 'movie' }));
      }
    }
    return { data: results, page, totalPages: 1, totalItems: results.length };
  }

  async getAdultMovies(page = 1): Promise<PaginatedResponse<Movie>> {
    await this.ensureGenreMap();
    const romanceId = (this.genreMap || {})['Romance']?.movie;
    const pagesToFetch = 5;
    const results: Movie[] = [];
    for (let p = page; p < page + pagesToFetch; p++) {
      const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/movie?with_genres=${romanceId}&include_adult=true&certification_country=US&certification.gte=R&sort_by=popularity.desc&page=${p}&api_key=${TMDB_KEY}`);
      results.push(...(r.results || []).map((m: any) => ({
        id: String(m.id),
        title: m.title,
        cover: m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : '',
        rating: m.vote_average || 0,
        genre: ['Romance','Adult'],
        country: (m.origin_country && m.origin_country[0]) || '',
        year: (m.release_date || '').slice(0, 4),
        synopsis: m.overview || '',
        type: 'movie',
      })));
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
    const pagesToFetch = 5;
    if (drama?.tv) {
      for (let p = page; p < page + pagesToFetch; p++) {
        const r = await this.fetchWithFallback(`${TMDB_BASE}/discover/tv?with_genres=${drama.tv}&with_origin_country=KR&page=${p}&api_key=${TMDB_KEY}`);
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
    }
    return { data: results, page, totalPages: 1, totalItems: results.length };
  }
}

export const movieAPI = new MovieAPI();
