import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function YearList() {
  const { data: years, isLoading, error } = useQuery({
    queryKey: ['years'],
    queryFn: () => movieAPI.getYears(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load years.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Browse by Year</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {years?.sort((a, b) => Number(b) - Number(a)).map((year) => (
          <Link key={year} to={`/year/${year}`}>
            <Card className="cursor-pointer hover:shadow-card-hover transition-smooth group">
              <CardContent className="p-6 flex items-center justify-center gap-3 min-h-24">
                <Calendar className="h-5 w-5 text-primary group-hover:scale-110 transition-smooth" />
                <h3 className="text-xl font-semibold group-hover:text-primary transition-smooth">
                  {year}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
