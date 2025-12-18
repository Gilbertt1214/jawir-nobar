import { Link, useLocation } from "react-router-dom"
import { Star, Play } from "lucide-react"
import { Movie } from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { translateCountry } from "@/lib/translate"

interface MovieCardProps {
  movie: Movie
  index?: number
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const { t, language } = useLanguage()
  const location = useLocation()

  return (
    <div className="block group/card">
      <Link
        to={`/${movie.type}/${movie.slug || movie.id}`}
        state={{ from: location }}
      >
        <Card className="overflow-hidden rounded-xl border bg-card shadow-sm group/card">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-card transition-all duration-300 ease-out group-hover/card:scale-105 group-hover/card:shadow-lg">
            <img
              src={movie.cover || "/placeholder.svg"}
              alt={movie.title}
              className="object-cover w-full h-full bg-muted"
              loading="lazy"
              draggable="false"
              onError={(e) => {
                const target = e.currentTarget
                if (target.src !== "/placeholder.svg") {
                  target.src = "/placeholder.svg"
                }
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-300" />

            <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
              <div className="p-4 rounded-full bg-primary/90 text-primary-foreground shadow-lg transform scale-75 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 transition-all duration-300">
                <Play className="h-8 w-8 fill-current ml-1" />
              </div>
            </div>

            {movie.type === "series" && (
              <Badge className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-md border border-border text-foreground px-2 py-0.5 text-xs font-medium uppercase tracking-wider">
                {t("typeSeries")}
              </Badge>
            )}
            {movie.type === "anime" && (
              <Badge className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-md border border-border text-foreground px-2 py-0.5 text-xs font-medium uppercase tracking-wider">
                {t("typeAnime")}
              </Badge>
            )}

            {movie.rating && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-secondary/80 backdrop-blur-md border border-border px-2 py-1 rounded-md">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold text-foreground">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
            )}

            {movie.quality && (
              <Badge className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-md border border-border text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
                {movie.quality}
              </Badge>
            )}
          </div>

          <CardContent className="p-3 space-y-1.5">
            <h3 className="font-bold line-clamp-1 text-sm sm:text-base group-hover/card:text-primary transition-colors duration-300">
              {movie.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {movie.latestEpisode && movie.type === "anime" && (
                <span>
                  {/^\d+$/.test(movie.latestEpisode)
                    ? t("cleanEpisodes").replace("{count}", movie.latestEpisode)
                    : movie.latestEpisode}
                </span>
              )}
              {movie.latestEpisode && movie.year && (
                <span className="text-muted-foreground/50">•</span>
              )}
              {movie.year && <span>{movie.year}</span>}
              {movie.country && (movie.year || movie.latestEpisode) && (
                <span className="text-muted-foreground/50">•</span>
              )}
              {movie.country && (
                <span className="line-clamp-1">
                  {translateCountry(movie.country, language)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
