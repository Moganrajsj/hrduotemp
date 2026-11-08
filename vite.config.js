import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
    server: {
        // Vite only serves front-end assets. Proxy everything else to the
        // Laravel dev server so http://localhost:3000 also shows the site.
        proxy: {
            '^(?!/@vite|/@id|/@fs|/node_modules|/__vite_ping|/resources/|/src/).*': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: false,
            },
        },
    },
});
