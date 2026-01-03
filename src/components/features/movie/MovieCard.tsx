import { Link, useLocation } from "react-router-dom";
import { Play, Star, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Movie } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateCountry } from "@/lib/translate";
import { Card, CardContent } from "@/components/ui/card";

interface MovieCardProps {
  movie: Movie;
  index?: number;
  className?: string;
  aspectRatio?: "portrait" | "landscape";
}

const MotionLink = motion(Link);

export function MovieCard({ movie, className, aspectRatio = "portrait" }: MovieCardProps) {
  const { t, language } = useLanguage();
  const location = useLocation();
  const isPortrait = aspectRatio === "portrait";

  // Format Episode count (remove "Eps" text)
  const formattedEpisodes = movie.totalEpisodes
    ? movie.totalEpisodes.replace(/\s*eps$/i, '')
    : null;

  return (
    <div className="block group/card h-full w-full">
        <MotionLink
            to={`/${movie.type}/${movie.id}`}
            state={{ from: location }}
            className={cn(
                "group relative block h-full bg-card rounded-xl overflow-hidden isolate",
                "shadow-sm dark:shadow-none", // Light mode depth
                "hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-shadow duration-300",
                className
            )}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
        <Card className="h-full w-full overflow-hidden rounded-xl border-0 bg-transparent shadow-none">
          <div className={cn(
              "relative w-full overflow-hidden bg-muted shadow-card transition-all duration-300 ease-out",
              isPortrait ? "aspect-[2/3]" : "aspect-video"
          )}>
            <img
              src={movie.cover || "/placeholder.svg"}
              alt={movie.title}
              className="object-cover w-full h-full bg-muted transition-transform duration-500 group-hover/card:scale-110"
              loading="lazy"
              decoding="async"
              draggable="false"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== "/placeholder.svg") {
                  target.src = "/placeholder.svg";
                }
              }}
            />

            {/* Overlay Gradient - Darker on hover for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />



            {movie.type === "series" && (
              <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                {t("typeSeries")}
              </Badge>
            )}
            {movie.type === "anime" && (
              <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                {t("typeAnime")}
              </Badge>
            )}

            {movie.rating && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 sm:px-2 py-1 rounded-md">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-[10px] sm:text-xs font-bold text-white">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
            )}

            {movie.quality && (
              <Badge className="absolute bottom-2 right-2 bg-primary/90 backdrop-blur-md border border-primary/20 text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm">
                {movie.quality}
              </Badge>
            )}
          </div>

          <CardContent className="p-2 sm:p-3 space-y-1 sm:space-y-1.5">
            <h3 className="font-bold line-clamp-1 text-sm sm:text-base group-hover/card:text-primary transition-colors duration-300 leading-tight">
              {movie.title}
            </h3>

            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
              {movie.latestEpisode && movie.type === "anime" && (
                <span className="text-primary font-medium">
                  {/^\d+$/.test(movie.latestEpisode)
                    ? t("cleanEpisodes").replace("{count}", movie.latestEpisode)
                    : movie.latestEpisode}
                </span>
              )}
              {movie.latestEpisode && movie.year && (
                <span className="text-muted-foreground/80">•</span>
              )}
              {movie.year && <span>{movie.year}</span>}
              {movie.country && (movie.year || movie.latestEpisode) && (
                <span className="text-muted-foreground/80">•</span>
              )}
              {movie.country && (
                <span className="line-clamp-1">
                  {translateCountry(movie.country, language)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </MotionLink>
    </div>
  );
}
