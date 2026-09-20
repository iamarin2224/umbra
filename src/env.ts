// ─── Umbra Environment Accessors ─────────────────────────────────────────────
// Provides unified environment configuration access for Node.js (process.env)
// and browser/client runtimes (import.meta.env).

function getRuntimeEnv(): Record<string, string | undefined> {
    if (typeof process !== 'undefined' && process.env) {
        return process.env;
    }
    return {};
}

export const env = {
    get SUPABASE_URL(): string {
        const nodeVal = getRuntimeEnv()['SUPABASE_URL'];
        if (nodeVal) return nodeVal;
        // @ts-expect-error Vite client runtime injection
        const viteVal = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
        return viteVal || '';
    },
    get SUPABASE_ANON_KEY(): string {
        const nodeVal = getRuntimeEnv()['SUPABASE_ANON_KEY'];
        if (nodeVal) return nodeVal;
        // @ts-expect-error Vite client runtime injection
        const viteVal = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY;
        return viteVal || '';
    },
};
