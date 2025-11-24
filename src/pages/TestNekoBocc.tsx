// Test page for debugging NekoBocc API
import { useState } from "react";
import { movieAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TestNekoBocc() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testReleaseList = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Testing getNekoBoccReleaseList...");
            const data = await movieAPI.getNekoBoccReleaseList(1);
            console.log("Result:", data);
            setResult(data);
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testDetail = async () => {
        if (!result || result.data.length === 0) {
            setError("Please test release list first");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const firstId = result.data[0].id;
            console.log("Testing getNekoBoccDetail with ID:", firstId);
            const data = await movieAPI.getNekoBoccDetail(firstId);
            console.log("Result:", data);
            setResult(data);
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testAllSources = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Testing getAllHentaiLatest...");
            const data = await movieAPI.getAllHentaiLatest(1);
            console.log("Result:", data);
            setResult(data);
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-6">NekoBocc API Test</h1>

            <div className="grid gap-4 mb-6">
                <Button onClick={testReleaseList} disabled={loading}>
                    Test Release List
                </Button>
                <Button onClick={testDetail} disabled={loading}>
                    Test Detail (First Item)
                </Button>
                <Button onClick={testAllSources} disabled={loading}>
                    Test All Sources
                </Button>
            </div>

            {loading && (
                <Alert>
                    <AlertDescription>Loading...</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <Alert className="mt-6">
                <AlertDescription>
                    <p className="font-semibold mb-2">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Click "Test Release List" to fetch data</li>
                        <li>Check console (F12) for detailed logs</li>
                        <li>If data loads, click "Test Detail"</li>
                        <li>Check result JSON below</li>
                    </ol>
                </AlertDescription>
            </Alert>
        </div>
    );
}
