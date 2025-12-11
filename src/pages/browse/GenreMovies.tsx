import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { MovieGrid } from "@/components/features/movie/MovieGrid";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonGrid } from "@/components/features/movie/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateGenre } from "@/lib/translate";

export default function GenreMovies() {
    const { genre } = useParams<{ genre: string }>();
    const [currentPage, setCurrentPage] = useState(1);
    const { language } = useLanguage();

    // Redirect to JAV page if genre is JAV
    if (genre?.toLowerCase() === "jav" || genre?.toLowerCase() === "hentai") {
        return <Navigate to="/hentai" replace />;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["genre-movies", genre, currentPage],
        queryFn: () => movieAPI.getMoviesByGenre(genre!, currentPage),
        enabled: !!genre,
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-10 w-48 bg-muted animate-pulse rounded" />
                </div>
                <SkeletonGrid />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Failed to load movies.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">
                    {translateGenre(genre?.replace(/-/g, " ") || "", language)}
                </h1>
                <p className="text-muted-foreground">
                    {data?.totalItems || 0} movie
                    {data?.totalItems !== 1 ? "s" : ""} available
                </p>
            </div>

            {data?.data && data.data.length > 0 ? (
                <>
                    <MovieGrid movies={data.data} />
                    {data.totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No movies found in this genre.
                    </p>
                </div>
            )}
        </div>
    );
}
