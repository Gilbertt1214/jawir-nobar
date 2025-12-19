import { useQuery } from "@tanstack/react-query"
import { movieAPI } from "@/services/api"
import { Link } from "react-router-dom"
import { Film } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translateGenre } from "@/lib/translate"

export default function GenreList() {
  const { t, language } = useLanguage()

  const {
    data: genres,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["genres", language],
    queryFn: () => movieAPI.getAllGenres(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <Skeleton className="h-12 w-64 mb-10 bg-secondary" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-secondary" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t("failedToLoadGenres")}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-10 md:mb-12">
          {t("browseByGenre")}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres
            ?.filter(genre => {
                 // Filter out redundant "Action & Adventure" if "Action" exists (common TMDB issue)
                 if (genre === "Action & Adventure") return false;
                 return true;
            })
            .map((genre) => (
            <Link
              key={genre}
              to={`/genre/${encodeURIComponent(genre)}`}
              className="block"
            >
              <div className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-lg transition-all duration-300 hover:border-foreground hover:shadow-[4px_4px_0px_#000] dark:hover:shadow-[4px_4px_0px_#fff] group">
                <Film className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {translateGenre(genre, language)}
                </span>
              </div>
            </Link>
          ))}

          {/* Hentai - Moved to bottom */}
          <Link to="/hentai" className="block">
            <div className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-lg transition-all duration-300 hover:border-foreground hover:shadow-[4px_4px_0px_#000] dark:hover:shadow-[4px_4px_0px_#fff] group">
              <Film className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                Hentai
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            {t("selectGenreHint")}
          </p>
        </div>
      </div>
    </div>
  )
}
