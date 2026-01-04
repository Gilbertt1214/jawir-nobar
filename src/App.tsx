import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ContextMenu } from "@/components/layout/ContextMenu";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PageTransition } from "@/components/layout/PageTransition";
import { useEffect, Suspense, lazy } from "react";
import Lenis from "lenis";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

const Home = lazy(() => import("./pages/home/Home"));
const MovieDetail = lazy(() => import("./pages/movie/MovieDetail"));
const SeriesEpisodes = lazy(() => import("./pages/series/SeriesEpisodes"));
const EpisodeDetail = lazy(() => import("./pages/series/EpisodeDetail"));
const Search = lazy(() => import("./pages/browse/Search"));
const GenreList = lazy(() => import("./pages/browse/GenreList"));
const GenreMovies = lazy(() => import("./pages/browse/GenreMovies"));
const CountryList = lazy(() => import("./pages/browse/CountryList"));
const CountryMovies = lazy(() => import("./pages/browse/CountryMovies"));
const YearList = lazy(() => import("./pages/browse/YearList"));
const YearMovies = lazy(() => import("./pages/browse/YearMovies"));
const BrowseCategory = lazy(() => import("./pages/browse/BrowseCategory"));
const HentaiList = lazy(() => import("./pages/hentai/HentaiList"));
const HentaiInfo = lazy(() => import("./pages/hentai/HentaiInfo"));
const HentaiWatch = lazy(() => import("./pages/hentai/HentaiWatch"));
const AnimeList = lazy(() => import("./pages/anime/AnimeList"));
const AnimeInfo = lazy(() => import("./pages/anime/AnimeInfo"));
const AnimeWatch = lazy(() => import("./pages/anime/AnimeWatch"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Snowfall = lazy(() => import("react-snowfall"));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <PageTransition>
                            <Home />
                        </PageTransition>
                    }
                />

                <Route
                    path="/movie/:id"
                    element={
                        <PageTransition>
                            <MovieDetail />
                        </PageTransition>
                    }
                />
                <Route
                    path="/series/:id"
                    element={
                        <PageTransition>
                            <MovieDetail />
                        </PageTransition>
                    }
                />
                <Route
                    path="/series/:id/episodes"
                    element={
                        <PageTransition>
                            <SeriesEpisodes />
                        </PageTransition>
                    }
                />
                <Route
                    path="/series/:id/watch"
                    element={
                        <PageTransition>
                            <EpisodeDetail />
                        </PageTransition>
                    }
                />

                <Route
                    path="/hentai"
                    element={
                        <PageTransition>
                            <HentaiList />
                        </PageTransition>
                    }
                />
                <Route
                    path="/hentai/nekopoi/:slug"
                    element={
                        <PageTransition>
                            <HentaiInfo />
                        </PageTransition>
                    }
                />
                <Route
                    path="/hentai/watch/:id"
                    element={
                        <PageTransition>
                            <HentaiWatch />
                        </PageTransition>
                    }
                />

                <Route
                    path="/anime"
                    element={
                        <PageTransition>
                            <AnimeList />
                        </PageTransition>
                    }
                />
                <Route
                    path="/anime/:slug"
                    element={
                        <PageTransition>
                            <AnimeInfo />
                        </PageTransition>
                    }
                />
                <Route
                    path="/anime/watch/:slug"
                    element={
                        <PageTransition>
                            <AnimeWatch />
                        </PageTransition>
                    }
                />

                <Route
                    path="/browse/:category"
                    element={
                        <PageTransition>
                            <BrowseCategory />
                        </PageTransition>
                    }
                />
                <Route
                    path="/search"
                    element={
                        <PageTransition>
                            <Search />
                        </PageTransition>
                    }
                />

                <Route
                    path="/genres"
                    element={
                        <PageTransition>
                            <GenreList />
                        </PageTransition>
                    }
                />
                <Route
                    path="/genre/:genre"
                    element={
                        <PageTransition>
                            <GenreMovies />
                        </PageTransition>
                    }
                />

                <Route
                    path="/countries"
                    element={
                        <PageTransition>
                            <CountryList />
                        </PageTransition>
                    }
                />
                <Route
                    path="/country/:country"
                    element={
                        <PageTransition>
                            <CountryMovies />
                        </PageTransition>
                    }
                />

                <Route
                    path="/years"
                    element={
                        <PageTransition>
                            <YearList />
                        </PageTransition>
                    }
                />
                <Route
                    path="/year/:year"
                    element={
                        <PageTransition>
                            <YearMovies />
                        </PageTransition>
                    }
                />

                <Route
                    path="*"
                    element={
                        <PageTransition>
                            <NotFound />
                        </PageTransition>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
};

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isDetailPage =
        (location.pathname.startsWith("/movie/") ||
            location.pathname.startsWith("/series/") ||
            location.pathname.startsWith("/anime/") ||
            location.pathname.startsWith("/hentai/nekopoi/")) &&
        !location.pathname.includes("/watch") &&
        !location.pathname.includes("/episodes");

    return (
        <main className="flex-1 relative">
            {!isDetailPage && <Breadcrumb />}
            {children}
        </main>
    );
};

const App = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.1,
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
            <ThemeProvider defaultTheme="dark">
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
                                    {/* Christmas Snowfall Effect 🎄 */}
                                    <Suspense fallback={null}>
                                        <Snowfall
                                            color="white"
                                            snowflakeCount={150}
                                            radius={[0.5, 2.5]}
                                            speed={[0.5, 2]}
                                            wind={[-0.5, 1]}
                                            style={{
                                                position: "fixed",
                                                width: "100vw",
                                                height: "100vh",
                                                zIndex: 9999,
                                                pointerEvents: "none",
                                            }}
                                        />
                                    </Suspense>
                                <Navbar />
                                <ContentLayout>
                                    <Suspense fallback={<PageLoader />}>
                                        <AnimatedRoutes />
                                    </Suspense>
                                </ContentLayout>
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
