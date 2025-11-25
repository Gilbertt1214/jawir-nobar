import { Link } from "react-router-dom";
import { Star, Play, Info } from "lucide-react";
import { Movie } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
    movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
    return (
        <Link to={`/${movie.type}/${movie.id}`}>
            <Card className="overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-2">
                <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                    {/* Image with zoom effect */}
                    <img
                        src={movie.cover || "/placeholder.svg"}
                        alt={movie.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-all duration-700 ease-out"
                        loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-all duration-500" />

                    {/* Hover overlay with play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <div className="relative">
                                {/* Pulsing ring effect */}
                                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                                <div className="relative p-4 rounded-full bg-primary/90 backdrop-blur-sm shadow-2xl">
                                    <Play className="h-8 w-8 text-primary-foreground fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Type badge */}
                    {movie.type === "series" && (
                        <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground backdrop-blur-sm border border-primary/20 shadow-lg font-semibold px-3 py-1 group-hover:scale-110 transition-transform duration-300">
                            Series
                        </Badge>
                    )}

                    {/* Rating badge */}
                    {movie.rating && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg group-hover:scale-110 group-hover:bg-black/80 transition-all duration-300">
                            <Star className="h-4 w-4 fill-accent text-accent drop-shadow-lg" />
                            <span className="text-sm font-bold text-white">
                                {movie.rating.toFixed(1)}
                            </span>
                        </div>
                    )}

                    {/* Info button on hover */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                        <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background transition-colors">
                            <Info className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                </div>

                <CardContent className="p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 bg-gradient-to-b from-card to-card/80">
                    {/* Title with gradient on hover */}
                    <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-all duration-300 text-xs sm:text-sm md:text-base leading-tight min-h-[2rem] sm:min-h-[2.5rem]">
                        {movie.title}
                    </h3>

                    {/* Year and Country */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
                        {movie.year && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-muted/50">
                                {movie.year}
                            </span>
                        )}
                        {movie.country && (
                            <>
                                <span className="text-border hidden sm:inline">
                                    •
                                </span>
                                <span className="line-clamp-1 flex-1">
                                    {movie.country}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Genre tags */}
                    {movie.genre && movie.genre.length > 0 && (
                        <div className="flex gap-1 sm:gap-1.5 flex-wrap pt-0.5 sm:pt-1">
                            {movie.genre.slice(0, 2).map((g) => (
                                <Badge
                                    key={g}
                                    variant="secondary"
                                    className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0 sm:py-0.5 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                                >
                                    {g}
                                </Badge>
                            ))}
                            {movie.genre.length > 2 && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0 sm:py-0.5"
                                >
                                    +{movie.genre.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
