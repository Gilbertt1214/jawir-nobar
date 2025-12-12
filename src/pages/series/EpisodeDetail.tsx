import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { movieAPI, type StreamingProvider, type Episode } from "@/services/api"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ChevronDown,
  MonitorPlay,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo } from "react"

export default function EpisodeDetail() {
  const { id: seriesId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const seasonFromUrl = searchParams.get("season")
  const episodeFromUrl = searchParams.get("episode")

  const apiEpisodeId =
    seasonFromUrl && episodeFromUrl
      ? `${seasonFromUrl}-${episodeFromUrl}`
      : undefined

  const { data: allEpisodes = [] } = useQuery<Episode[]>({
    queryKey: ["episodes", seriesId],
    queryFn: async () => {
      if (!seriesId) return []
      const eps = await movieAPI.getEpisodes(seriesId)
      if (!Array.isArray(eps)) return []
      return eps
        .filter(
          (ep) =>
            ep &&
            typeof ep.seasonNumber === "number" &&
            typeof ep.episodeNumber === "number"
        )
        .sort((a, b) => {
          if (a.seasonNumber !== b.seasonNumber) {
            return a.seasonNumber - b.seasonNumber
          }
          return a.episodeNumber - b.episodeNumber
        })
    },
    enabled: !!seriesId,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: episode,
    isLoading: episodeLoading,
    error: episodeError,
    refetch: refetchEpisode,
  } = useQuery({
    queryKey: ["episode", seriesId, apiEpisodeId],
    queryFn: async () => {
      if (!seriesId) throw new Error("Series ID is missing")
      if (!apiEpisodeId)
        throw new Error("Episode ID is missing. Check URL parameters.")

      const response = await movieAPI.getEpisodeById(seriesId, apiEpisodeId)
      if (!response) throw new Error("Episode not found")
      return response
    },
    enabled: !!seriesId && !!apiEpisodeId,
    retry: 2,
    staleTime: 60000,
  })

  const {
    data: providers,
    isLoading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: [
      "streamingProviders",
      seriesId,
      episode?.seasonNumber,
      episode?.episodeNumber,
    ],
    queryFn: async () => {
      if (!seriesId || !episode) throw new Error("Episode data not available")

      const streamingProviders = await movieAPI.getEpisodeStreamingUrl(
        seriesId,
        episode.seasonNumber,
        episode.episodeNumber
      )

      return streamingProviders.sort((a, b) => {
        if (a.tier !== b.tier) return (a.tier || 4) - (b.tier || 4)
        return (a as any).priority - (b as any).priority
      })
    },
    enabled: !!seriesId && !!episode,
    staleTime: 5 * 60 * 1000,
  })

  const [selectedProvider, setSelectedProvider] =
    useState<StreamingProvider | null>(null)

  useEffect(() => {
    if (providers && providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0])
    }
  }, [providers, selectedProvider])

  const { prevEpisode, nextEpisode, currentIndex } = useMemo(() => {
    if (!allEpisodes.length || !episode) {
      return { prevEpisode: null, nextEpisode: null, currentIndex: -1 }
    }

    const currentIdx = allEpisodes.findIndex(
      (ep) =>
        ep.seasonNumber === episode.seasonNumber &&
        ep.episodeNumber === episode.episodeNumber
    )

    return {
      prevEpisode: currentIdx > 0 ? allEpisodes[currentIdx - 1] : null,
      nextEpisode:
        currentIdx < allEpisodes.length - 1
          ? allEpisodes[currentIdx + 1]
          : null,
      currentIndex: currentIdx,
    }
  }, [allEpisodes, episode])

  const navigateToEpisode = (ep: Episode) => {
    navigate(
      `/series/${seriesId}/watch?season=${ep.seasonNumber}&episode=${ep.episodeNumber}`
    )
    setSelectedProvider(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleProviderChange = (provider: StreamingProvider) => {
    setSelectedProvider(provider)
  }

  const handleRetryProviders = () => {
    refetchProviders()
  }

  const isLoading = episodeLoading || providersLoading
  const error = episodeError || providersError

  if (isLoading) {
    return (
      <div className="w-full max-w-full px-3 py-4">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="aspect-video w-full rounded-lg mb-6" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    )
  }

  if (error || !episode) {
    const errorMessage =
      error?.message || "Episode not found or failed to load."

    return (
      <div className="w-full max-w-full px-3 py-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
          <Link to={`/series/${seriesId}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              Go to Series
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => refetchEpisode()}
            className="w-full sm:w-auto"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full px-3 py-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">
              Episode {episode.episodeNumber}:{" "}
              <span className="text-primary">{episode.title}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Season {episode.seasonNumber} • Episode {episode.episodeNumber}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 px-3">
              <MonitorPlay className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Provider
              </span>
            </div>
            {providers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetryProviders}
                className="h-8 w-8 p-0 hover:bg-white/10"
                title="Refresh providers"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {providers && providers.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 border-white/10 bg-background/50"
                    disabled={!selectedProvider}
                  >
                    <span className="truncate max-w-[150px] text-xs">
                      {selectedProvider?.name || "Select Provider"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {providers.map((provider) => (
                    <DropdownMenuItem
                      key={provider.name}
                      onClick={() => handleProviderChange(provider)}
                      className="cursor-pointer text-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{provider.name}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {provider.quality && (
                            <span>{provider.quality}</span>
                          )}
                          {provider.language && (
                            <span>• {provider.language}</span>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-8 text-xs">
                No Providers
              </Button>
            )}
          </div>
        </div>

        {providersLoading && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Checking available streaming providers...
            </AlertDescription>
          </Alert>
        )}

        {providersError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load streaming providers.
              <Button
                variant="link"
                className="p-0 h-auto ml-1"
                onClick={handleRetryProviders}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {providers && providers.length === 0 && !providersLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No streaming providers available for this episode.
            </AlertDescription>
          </Alert>
        )}

        {selectedProvider && (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
            <iframe
              src={selectedProvider.url}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              frameBorder={0}
              title={`Episode ${episode.episodeNumber} - ${episode.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2 sm:gap-3 h-auto py-3 sm:py-4 px-3 sm:px-4 hover:bg-primary/10 hover:border-primary transition-all group disabled:opacity-50"
            disabled={!prevEpisode}
            onClick={() => prevEpisode && navigateToEpisode(prevEpisode)}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            {prevEpisode ? (
              <div className="flex flex-col items-start text-left min-w-0 flex-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                  Previous
                </span>
                <span className="font-semibold text-xs sm:text-sm truncate w-full">
                  S{prevEpisode.seasonNumber}E{prevEpisode.episodeNumber}:{" "}
                  {prevEpisode.title}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-muted-foreground">
                No previous episode
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex-1 justify-end gap-2 sm:gap-3 h-auto py-3 sm:py-4 px-3 sm:px-4 hover:bg-primary/10 hover:border-primary transition-all group disabled:opacity-50"
            disabled={!nextEpisode}
            onClick={() => nextEpisode && navigateToEpisode(nextEpisode)}
          >
            {nextEpisode ? (
              <div className="flex flex-col items-end text-right min-w-0 flex-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                  Next
                </span>
                <span className="font-semibold text-xs sm:text-sm truncate w-full">
                  S{nextEpisode.seasonNumber}E{nextEpisode.episodeNumber}:{" "}
                  {nextEpisode.title}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm text-muted-foreground">
                No next episode
              </span>
            )}
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {allEpisodes.length > 0 && currentIndex >= 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Episode Progress</span>
              <span>
                {currentIndex + 1} of {allEpisodes.length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    ((currentIndex + 1) / allEpisodes.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
