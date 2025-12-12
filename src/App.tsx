import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ContextMenu } from "@/components/layout/ContextMenu";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import Home from "./pages/home/Home";
import MovieDetail from "./pages/movie/MovieDetail";
import SeriesEpisodes from "./pages/series/SeriesEpisodes";
import EpisodeDetail from "./pages/series/EpisodeDetail";
import Search from "./pages/browse/Search";
import GenreList from "./pages/browse/GenreList";
import GenreMovies from "./pages/browse/GenreMovies";
import CountryList from "./pages/browse/CountryList";
import CountryMovies from "./pages/browse/CountryMovies";
import YearList from "./pages/browse/YearList";
import YearMovies from "./pages/browse/YearMovies";
import BrowseCategory from "./pages/browse/BrowseCategory";
import HentaiList from "./pages/hentai/HentaiList";
import HentaiInfo from "./pages/hentai/HentaiInfo";
import HentaiWatch from "./pages/hentai/HentaiWatch";
import AnimeList from "./pages/anime/AnimeList";
import AnimeInfo from "./pages/anime/AnimeInfo";
import AnimeWatch from "./pages/anime/AnimeWatch";

// Fallback
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1, // Reduce retries for faster failover
        },
    },
});

import { useEffect } from "react";
import Lenis from "lenis";

const App = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.8, // Reduced from 1.2 for snappier feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.1, // Slightly faster wheel response
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <LanguageProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter
                            future={{
                                v7_startTransition: true,
                                v7_relativeSplatPath: true,
                            }}
                        >
                            <ScrollToTop />
                            <ContextMenu />
                            <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
                                <Navbar />
                                <main className="flex-1 relative">
                                    <Breadcrumb />
                                    <Routes>
                                        {/* Home */}
                                        <Route path="/" element={<Home />} />

                                        {/* TMDB Movie & Series */}
                                        <Route
                                            path="/movie/:id"
                                            element={<MovieDetail />}
                                        />
                                        <Route
                                            path="/series/:id"
                                            element={<MovieDetail />}
                                        />
                                        <Route
                                            path="/series/:id/episodes"
                                            element={<SeriesEpisodes />}
                                        />
                                        <Route
                                            path="/series/:id/watch"
                                            element={<EpisodeDetail />}
                                        />

                                        {/* Hentai - Nekopoi */}
                                        <Route
                                            path="/hentai"
                                            element={<HentaiList />}
                                        />
                                        <Route
                                            path="/hentai/nekopoi/:slug"
                                            element={<HentaiInfo />}
                                        />
                                        <Route
                                            path="/hentai/watch/:id"
                                            element={<HentaiWatch />}
                                        />

                                        {/* Anime Routes (Otakudesu/Sanka API) */}
                                        <Route
                                            path="/anime"
                                            element={<AnimeList />}
                                        />
                                        <Route
                                            path="/anime/:slug"
                                            element={<AnimeInfo />}
                                        />
                                        <Route
                                            path="/anime/watch/:slug"
                                            element={<AnimeWatch />}
                                        />

                                        {/* Browse (Kategori Khusus) */}
                                        <Route
                                            path="/browse/:category"
                                            element={<BrowseCategory />}
                                        />

                                        {/* Pencarian */}
                                        <Route
                                            path="/search"
                                            element={<Search />}
                                        />

                                        {/* Genre */}
                                        <Route
                                            path="/genres"
                                            element={<GenreList />}
                                        />
                                        <Route
                                            path="/genre/:genre"
                                            element={<GenreMovies />}
                                        />

                                        {/* Negara */}
                                        <Route
                                            path="/countries"
                                            element={<CountryList />}
                                        />
                                        <Route
                                            path="/country/:country"
                                            element={<CountryMovies />}
                                        />

                                        {/* Tahun */}
                                        <Route
                                            path="/years"
                                            element={<YearList />}
                                        />
                                        <Route
                                            path="/year/:year"
                                            element={<YearMovies />}
                                        />

                                        {/* 404 */}
                                        <Route
                                            path="*"
                                            element={<NotFound />}
                                        />
                                    </Routes>
                                </main>
                                <Footer />
                            </div>
                        </BrowserRouter>
                    </TooltipProvider>
                </LanguageProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
