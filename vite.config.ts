import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
                fonts: [
                    bunny('Outfit', {
                        weights: [400, 500, 600, 700],
                    }),
                ],
            }),
            inertia(),
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        server: {
            host: env.VITE_DEV_SERVER_HOST || '0.0.0.0',
            port: Number(env.VITE_DEV_SERVER_PORT) || 5173,
            strictPort: true,
            cors: true,
            origin: env.VITE_DEV_SERVER_ORIGIN || undefined,
        hmr: {
            host: env.VITE_DEV_SERVER_HMR_HOST || 'localhost',
        },
        },
    };
});
