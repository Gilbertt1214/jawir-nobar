import { Movie } from "@/services/api";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
    movies: Movie[];
    className?: string;
}

export function MovieGrid({ movies, className = "" }: MovieGridProps) {
    return (
        <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 ${className}`}
        >
            {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
    );
}
