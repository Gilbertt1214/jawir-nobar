import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextMenu } from "@/components/ContextMenu";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import SeriesEpisodes from "./pages/SeriesEpisodes";
import EpisodeDetail from "./pages/EpisodeDetail";
import Search from "./pages/Search";
import GenreList from "./pages/GenreList";
import GenreMovies from "./pages/GenreMovies";
import CountryList from "./pages/CountryList";
import CountryMovies from "./pages/CountryMovies";
import YearList from "./pages/YearList";
import YearMovies from "./pages/YearMovies";
import BrowseCategory from "./pages/BrowseCategory";
import HentaiList from "./pages/HentaiList";
import HentaiInfo from "./pages/HentaiInfo";
import HentaiWatch from "./pages/HentaiWatch";
import AnimeList from "./pages/AnimeList";
import AnimeInfo from "./pages/AnimeInfo";
import AnimeWatch from "./pages/AnimeWatch";

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
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
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
                            <main className="flex-1">
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
                                        path="/series/:seriesId/watch"
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
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                    </BrowserRouter>
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
