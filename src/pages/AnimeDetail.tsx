
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AnimeDetail() {
    const { malId, number, subOrDub } = useParams<{
        malId: string;
        number: string;
        subOrDub: string;
    }>();

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to={`/`}>
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </Link>

            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-semibold">Anime</h1>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-card-hover">
                    <iframe
                        src={`https://vidlink.pro/anime/${malId}/${number}/${subOrDub}?player=jw`}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        frameBorder={0}
                    />
                </div>
            </div>
        </div>
    );
}
