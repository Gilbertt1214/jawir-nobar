export default {
    async fetch(): Promise<Response> {
        // Assets akan di-serve otomatis oleh Cloudflare
        // Worker ini hanya fallback jika asset tidak ditemukan
        return new Response("Not Found", { status: 404 });
    },
};
