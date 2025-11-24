// Utility functions

export function extractIdFromUrl(url: string): string {
    const parts = url.split("/");
    return parts[parts.length - 2] || parts[parts.length - 1] || "unknown";
}

export function extractIdFromNekopoiUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter((part) => part);
        return pathParts[pathParts.length - 1] || "unknown";
    } catch {
        const parts = url.split("/");
        return parts[parts.length - 1] || "unknown";
    }
}
