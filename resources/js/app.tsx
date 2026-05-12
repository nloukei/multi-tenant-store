import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

import { Toaster } from '@/components/ui/toast';

import { router } from '@inertiajs/react';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster />
            </>
        );
    },
    progress: {
        color: '#171717',
        showSpinner: true,
    },
});

// Swap favicon to a spinner during Inertia navigation to simulate browser tab loading
let originalFavicon = '';
const animatedFavicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none' stroke='black' stroke-width='4' stroke-linecap='round'%3E%3Cpath d='M16 4A12 12 0 1 0 28 16'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 16 16' to='360 16 16' dur='0.8s' repeatCount='indefinite'/%3E%3C/path%3E%3C/svg%3E`;

router.on('start', () => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    if (!originalFavicon) {
        originalFavicon = link.href || '/favicon.ico';
    }
    link.href = animatedFavicon;
});

router.on('finish', () => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link && originalFavicon) {
        link.href = originalFavicon;
    }
});

// This will set light / dark mode on load...
initializeTheme();
