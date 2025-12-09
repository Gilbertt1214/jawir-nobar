import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function GenreList() {
    const {
        data: genres,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["genres"],
        queryFn: () => movieAPI.getAllGenres(),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <div className="container mx-auto px-4 py-10 md:py-12">
                    <Skeleton className="h-12 w-64 mb-10 bg-[#1a1a1a]" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-16 rounded-lg bg-[#1a1a1a]"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <div className="container mx-auto px-4 py-10">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Gagal memuat daftar genre.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="container mx-auto px-4 py-10 md:py-12">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-10 md:mb-12">
                    Browse by Genre
                </h1>

                {/* Genre Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Hentai */}
                    <Link to="/hentai" className="block">
                        <div className="flex items-center gap-3 px-5 py-4 bg-[#121212] border border-white/10 rounded-lg transition-all duration-300 hover:bg-[#1a1a1a] hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] group">
                            <Film className="w-5 h-5 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-semibold text-white group-hover:text-red-400 transition-colors duration-300">
                                Hentai
                            </span>
                        </div>
                    </Link>

                    {/* Regular Genres */}
                    {genres?.map((genre) => (
                        <Link
                            key={genre}
                            to={`/genre/${encodeURIComponent(genre)}`}
                            className="block"
                        >
                            <div className="flex items-center gap-3 px-5 py-4 bg-[#121212] border border-white/10 rounded-lg transition-all duration-300 hover:bg-[#1a1a1a] hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] group">
                                <Film className="w-5 h-5 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-semibold text-white group-hover:text-red-400 transition-colors duration-300">
                                    {genre}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        Pilih genre favorit kamu untuk menemukan film dan series
                        yang sesuai
                    </p>
                </div>
            </div>
        </div>
    );
}
