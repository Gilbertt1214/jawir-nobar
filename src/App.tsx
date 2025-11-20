import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
import NotFound from "./pages/NotFound";
import AnimeDetail from "./pages/AnimeDetail";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/series/:id" element={<MovieDetail />} />
                <Route path="/series/:id/episodes" element={<SeriesEpisodes />} />
                <Route path="/series/:seriesId/episodes/:episodeId" element={<EpisodeDetail />} />
                <Route path="/anime/:malId/:number/:subOrDub" element={<AnimeDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/genres" element={<GenreList />} />
                <Route path="/genre/:genre" element={<GenreMovies />} />
                <Route path="/countries" element={<CountryList />} />
                <Route path="/country/:country" element={<CountryMovies />} />
                <Route path="/years" element={<YearList />} />
                <Route path="/year/:year" element={<YearMovies />} />
                <Route path="/anime/:malId/:number/:subOrDub" element={<AnimeDetail />} />
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

export default App;
