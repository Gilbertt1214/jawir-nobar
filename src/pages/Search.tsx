import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { MovieGrid } from '@/components/MovieGrid';
import { Pagination } from '@/components/Pagination';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, currentPage],
    queryFn: () => movieAPI.searchMovies(query, currentPage),
    enabled: !!query,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <SearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Search for Movies & Series</h2>
          <p className="text-muted-foreground">Use the search bar above to find your favorite content</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
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
          <AlertDescription>Failed to search. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-muted-foreground">
          {data?.totalItems || 0} result{data?.totalItems !== 1 ? 's' : ''} found
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
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
          <p className="text-muted-foreground">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
}
