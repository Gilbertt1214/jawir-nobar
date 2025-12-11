import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function YearList() {
    const {
        data: years,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["years"],
        queryFn: () => movieAPI.getYears(),
    });

    const { t } = useLanguage();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-10 md:py-12">
                    <Skeleton className="h-12 w-64 mb-10 bg-secondary" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 20 }).map((_, i) => (
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
                            {t('failedToLoadYears')}
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
                    {t('browseByYear')}
                </h1>

                {/* Year Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {years
                        ?.sort((a, b) => Number(b) - Number(a))
                        .map((year) => (
                            <Link
                                key={year}
                                to={`/year/${year}`}
                                className="block"
                            >
                                <div className="flex items-center justify-center gap-3 px-5 py-4 bg-card border border-border rounded-lg transition-all duration-300 hover:border-foreground hover:shadow-[4px_4px_0px_#000] dark:hover:shadow-[4px_4px_0px_#fff] group">
                                    <Calendar className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                        {year}
                                    </span>
                                </div>
                            </Link>
                        ))}
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        {t('selectYearHint')}
                    </p>
                </div>
            </div>
        </div>
    );
}
