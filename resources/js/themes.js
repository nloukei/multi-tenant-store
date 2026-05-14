export const themes = {
    colors: {
        background: '#09090b',
        primary: {
            light: '#a78bfa',   // violet-400
            DEFAULT: '#8b5cf6', // violet-500
            dark: '#7c3aed',    // violet-600
        },
        secondary: {
            light: '#818cf8',   // indigo-400
            DEFAULT: '#6366f1', // indigo-500
            dark: '#4f46e5',    // indigo-600
        },
        accent: {
            DEFAULT: '#d946ef', // fuchsia-500
            pink: '#ec4899',    // pink-500
        },
        success: {
            DEFAULT: '#34d399', // emerald-400
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            muted: 'rgba(255, 255, 255, 0.5)',
            dim: 'rgba(255, 255, 255, 0.3)',
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'rgba(255, 255, 255, 0.1)',
        }
    },
    gradients: {
        primary: 'linear-gradient(to bottom right, #8b5cf6, #4f46e5)', // violet-500 to indigo-600
        shimmer: 'linear-gradient(90deg, #a855f7, #6366f1, #ec4899, #a855f7)',
    }
};
