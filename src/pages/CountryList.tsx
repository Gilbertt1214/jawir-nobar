import { useQuery } from '@tanstack/react-query';
import { movieAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getCountryName } from '@/lib/countries';

export default function CountryList() {
  const { data: countries, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: () => movieAPI.getAllCountries(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
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
          <AlertDescription>Failed to load countries.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Browse by Country</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {countries?.map((country) => (
          <Link key={country} to={`/country/${encodeURIComponent(country)}`}>
            <Card className="cursor-pointer hover:shadow-card-hover transition-smooth group">
              <CardContent className="p-6 flex items-center justify-center gap-3 min-h-32">
                <Globe className="h-6 w-6 text-primary group-hover:scale-110 transition-smooth" />
                <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-smooth">
                  {getCountryName(country)}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
