import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { MovieGrid } from "@/components/features/movie/MovieGrid";
import { Pagination } from "@/components/common/Pagination";
import { SkeletonGrid } from "@/components/features/movie/SkeletonCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { getCountryName } from "@/lib/countries";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateCountry } from "@/lib/translate";

export default function CountryMovies() {
    const { country } = useParams<{ country: string }>();
    const [currentPage, setCurrentPage] = useState(1);
    const { language } = useLanguage();

    const { data, isLoading, error } = useQuery({
        queryKey: ["country-movies", country, currentPage, language],
        queryFn: () => movieAPI.getMoviesByCountry(country!, currentPage),
        enabled: !!country,
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Movies from{" "}
                    {country
                        ? translateCountry(getCountryName(country), language)
                        : "Unknown Country"}
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
                        No movies found from this country.
                    </p>
                </div>
            )}
        </div>
    );
}
