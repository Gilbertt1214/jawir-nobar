import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    AlertCircle,
    Server,
    ExternalLink,
    RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function AnimeWatch() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [selectedServer, setSelectedServer] = useState<number>(0);
    const [iframeKey, setIframeKey] = useState(0);

    const {
        data: streamData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["animeStream", slug],
        queryFn: () => movieAPI.getAnimeStreamLinks(slug!),
        enabled: !!slug,
    });

    // Reset selected server when slug changes
    useEffect(() => {
        setSelectedServer(0);
    }, [slug]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Button variant="ghost" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="aspect-video bg-muted animate-pulse rounded-lg w-full max-w-5xl mx-auto" />
                <div className="h-8 w-1/2 bg-muted animate-pulse rounded mx-auto" />
            </div>
        );
    }

    if (error || !streamData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load stream. Please try again or check your connection.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const currentStream = streamData.streamLinks[selectedServer];

    const handleServerChange = (value: string) => {
        setSelectedServer(Number(value));
        setIframeKey((prev) => prev + 1); // Force re-render iframe
    };

    return (
        <div className="container mx-auto px-4 py-6">
             <div className="mb-6 flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="hover:bg-white/10"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-xl md:text-2xl font-bold truncate flex-1">
                    {streamData.title}
                </h1>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Player Container */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                    {currentStream ? (
                        <iframe
                            key={iframeKey}
                            src={currentStream.url}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title="Anime Player"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No stream available for this server.
                        </div>
                    )}
                </div>

                {/* Controls & Servers */}
                <Card className="bg-card/50 backdrop-blur border-white/10">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Server className="w-5 h-5 text-primary" />
                            <span className="font-medium whitespace-nowrap">Server:</span>
                            <Select
                                value={String(selectedServer)}
                                onValueChange={handleServerChange}
                            >
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Select Server" />
                                </SelectTrigger>
                                <SelectContent>
                                    {streamData.streamLinks.map((link, idx) => (
                                        <SelectItem key={idx} value={String(idx)}>
                                            {link.server}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                             <Button
                                variant="outline"
                                onClick={() => setIframeKey(prev => prev + 1)}
                                className="flex-1 sm:flex-none"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reload
                            </Button>
                            {currentStream && (
                                <Button
                                    variant="secondary"
                                    onClick={() => window.open(currentStream.url, "_blank")}
                                    className="flex-1 sm:flex-none"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                 <Alert className="bg-primary/10 border-primary/20 text-primary">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        If the video doesn't play, try switching servers or click "Open" to watch in a new tab (some adblockers might interfere).
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
