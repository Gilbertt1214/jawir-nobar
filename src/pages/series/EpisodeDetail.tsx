import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { useQuery } from "@tanstack/react-query"
import { movieAPI, type StreamingProvider, type Episode } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  ChevronDown,
  MonitorPlay,
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SketchProgress } from "@/components/ui/SketchProgress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"

export default function EpisodeDetail() {
  const { id: seriesId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const seasonFromUrl = searchParams.get("season")
  const episodeFromUrl = searchParams.get("episode")
  const { t, language } = useLanguage()

  const apiEpisodeId =
    seasonFromUrl && episodeFromUrl
      ? `${seasonFromUrl}-${episodeFromUrl}`
      : undefined

  const { data: allEpisodes = [] } = useQuery<Episode[]>({
    queryKey: ["episodes", seriesId, language],
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
    queryKey: ["episode", seriesId, apiEpisodeId, language],
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-[300px] flex flex-col items-center text-center space-y-4">
          <div className="w-full flex justify-center scale-95 sm:scale-100">
            <SketchProgress
              demo
              label="Memuat Episode..."
              doneLabel="Siap Ditonton ✓"
            />
          </div>
          <p className="font-bold text-base text-foreground mt-2">
            {t('loading') || "Memuat Episode..."}
          </p>
        </div>
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
              {t('goToSeries')}
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight">
                {t('episode')} {episode.episodeNumber}:{" "}
                <span className="text-primary">{episode.title}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('season').replace('{season}', String(episode.seasonNumber))} • {t('episode')} {episode.episodeNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedProvider?.url, "_blank")}
                    className="text-xs gap-1.5 h-10 px-3 border-2 border-[#0f172a] dark:border-zinc-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
                    disabled={!selectedProvider}
                >
                    <MonitorPlay className="h-3.5 w-3.5" />
                    Open in New Tab
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryProviders}
                    className="text-xs gap-1.5 h-10 px-3 border-2 border-[#0f172a] dark:border-zinc-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#000]"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </Button>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-[#0f172a] dark:border-zinc-700 bg-card shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#000]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                   <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-foreground flex-shrink-0">
                      <MonitorPlay className="h-4 w-4 text-primary" />
                      <span>Select Server:</span>
                   </div>

                   {providers && providers.length > 0 ? (
                      <div className="w-full sm:w-[320px]">
                        <Select
                          value={selectedProvider?.name || providers[0]?.name}
                          onValueChange={(val) => {
                            const p = providers.find((x) => x.name === val)
                            if (p) handleProviderChange(p)
                          }}
                        >
                          <SelectTrigger className="w-full h-11 border-2 border-[#0f172a] dark:border-zinc-700 bg-background shadow-[2.5px_2.5px_0px_#0f172a] dark:shadow-[2.5px_2.5px_0px_#000] font-bold text-sm sm:text-base rounded-xl">
                            <SelectValue placeholder="Pilih Server">
                              {selectedProvider && (
                                <div className="flex items-center justify-between w-full pr-2">
                                  <span className="flex items-center gap-2 truncate">
                                    <Play className="h-3.5 w-3.5 fill-current text-primary flex-shrink-0" />
                                    Server {providers.findIndex((p) => p.name === selectedProvider.name) + 1} ({selectedProvider.name})
                                  </span>
                                  {selectedProvider.quality && (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1 leading-none py-0 ml-2">
                                      {selectedProvider.quality}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="border-2 border-[#0f172a] dark:border-zinc-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#000] rounded-xl max-h-[300px]">
                            {providers.map((provider, index) => (
                              <SelectItem
                                key={`${provider.name}-${index}`}
                                value={provider.name}
                                className="font-bold text-sm sm:text-base cursor-pointer py-2"
                              >
                                <div className="flex items-center justify-between w-full gap-3">
                                  <span className="flex items-center gap-2">
                                    <Play className={cn("h-3.5 w-3.5", selectedProvider?.name === provider.name ? "fill-current text-primary" : "text-muted-foreground")} />
                                    Server {index + 1} ({provider.name})
                                  </span>
                                  {provider.quality && (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1 leading-none py-0">
                                      {provider.quality}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                   ) : (
                      <Button variant="outline" size="sm" disabled className="h-10 text-xs">
                        {t('streamUnavailable')}
                      </Button>
                   )}
                </div>
             </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm">
                        <h4 className="font-semibold text-blue-100">Tips Agar Subtitle Indonesia Selalu Muncul:</h4>
                        <ul className="space-y-1.5 text-blue-100/80 list-disc ml-4">
                            <li>
                                <span className="font-medium text-blue-200">Jika muncul pop-up, silakan tutup dan klik play kembali.</span>
                            </li>
                            <li>
                                <span className="font-medium text-blue-200">Gunakan Multi-Server:</span> Jika di Server 1 (misal: VidLink) tidak ada sub Indo, cobalah Server 2 (misal: Vidsrc).
                            </li>
                            <li>
                                <span className="font-medium text-blue-200">Cek Ikon CC:</span> Klik ikon CC di pojok kanan bawah player untuk melihat daftar bahasa.
                            </li>
                            <li>
                                <span className="font-medium text-blue-200">Update Otomatis:</span> Subtitle Indonesia biasanya muncul otomatis beberapa hari setelah rilis HD.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>

        {providersLoading && (
          <div className="w-full max-w-[280px] mx-auto my-6 flex flex-col items-center justify-center text-center space-y-2">
            <SketchProgress demo label={t('searchingStreams')} />
            <p className="text-sm font-medium text-muted-foreground">
              {t('searchingStreams')}
            </p>
          </div>
        )}

        {providersError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('providerIssue')}
              <Button
                variant="link"
                className="p-0 h-auto ml-1"
                onClick={handleRetryProviders}
              >
                {t('retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {providers && providers.length === 0 && !providersLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('streamUnavailable')}
            </AlertDescription>
          </Alert>
        )}

        {selectedProvider && (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/10 group">
            <iframe
              src={selectedProvider.url}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              frameBorder={0}
              title={`${t('episode')} ${episode.episodeNumber} - ${episode.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; keyboard-map"
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
                  {t('previous')}
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
                  {t('next')}
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
               <span>{t('episodeProgress')}</span>
              <span>
                {currentIndex + 1} {t('of')} {allEpisodes.length}
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
