import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getCountryName } from "@/lib/countries";

export default function CountryList() {
    const {
        data: countries,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["countries"],
        queryFn: () => movieAPI.getAllCountries(),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-10 md:py-12">
                    <Skeleton className="h-12 w-64 mb-10 bg-secondary" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-16 rounded-lg bg-secondary"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-10">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Gagal memuat daftar negara.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-10 md:py-12">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-10 md:mb-12">
                    Browse by Country
                </h1>

                {/* Country Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {countries?.map((country) => (
                        <Link
                            key={country}
                            to={`/country/${encodeURIComponent(country)}`}
                            className="block"
                        >
                            <div className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-lg transition-all duration-300 hover:bg-secondary hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] group">
                                <Globe className="w-5 h-5 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-semibold text-foreground group-hover:text-red-500 transition-colors duration-300">
                                    {getCountryName(country)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        Pilih negara untuk menemukan film dan series dari negara
                        tersebut
                    </p>
                </div>
            </div>
        </div>
    );
}
