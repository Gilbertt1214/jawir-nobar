import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { Movie } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";


interface MovieCardProps {
    movie: Movie;
    index?: number; // For determining slide direction
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
    // Framer Motion variants for slide-in effect
    const variants = {
        hidden: { 
            opacity: 0, 
            x: 0,
            y: 20
        },
        visible: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as any, // Custom ease for smooth "premium" feel
                delay: (index % 4) * 0.1 // Stagger effect
            }
        }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
        >
            <Link to={`/${movie.type}/${movie.id}`} className="block group/card">
                <Card className="overflow-hidden border-0 bg-transparent shadow-none">
                    <motion.div 
                        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-card"
                        whileHover={{ 
                            scale: 1.03,
                            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                        }}
                    >
                        {/* Image */}
                        <motion.img
                            src={movie.cover || "/placeholder.svg"}
                            alt={movie.title}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            draggable="false"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        />

                        {/* Gradient overlay - always visible */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-500" />

                        {/* Hover overlay with play button */}
                        <motion.div 
                            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="p-4 rounded-full bg-primary/90 text-primary-foreground shadow-lg"
                                initial={{ scale: 0.5 }}
                                whileHover={{ scale: 1 }}
                                transition={{ 
                                    type: "spring" as const,
                                    stiffness: 300,
                                    damping: 15
                                }}
                            >
                                <Play className="h-8 w-8 fill-current ml-1" />
                            </motion.div>
                        </motion.div>

                        {/* Type badge */}
                        {movie.type === "series" && (
                            <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 text-xs font-medium uppercase tracking-wider">
                                Series
                            </Badge>
                        )}

                        {/* Rating badge */}
                        {movie.rating && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs font-bold text-white">
                                    {movie.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                        
                        {/* Quality Badge if available */}
                        {movie.quality && (
                            <Badge className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                                {movie.quality}
                            </Badge>
                        )}
                    </motion.div>

                    <CardContent className="p-3 space-y-1.5">
                        {/* Title */}
                        <h3 className="font-bold line-clamp-1 text-sm sm:text-base group-hover/card:text-primary transition-colors duration-300">
                            {movie.title}
                        </h3>

                        {/* Year and Country */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {movie.year && <span>{movie.year}</span>}
                            {movie.country && movie.year && <span className="text-primary/50">•</span>}
                            {movie.country && (
                                <span className="line-clamp-1">
                                    {movie.country}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
