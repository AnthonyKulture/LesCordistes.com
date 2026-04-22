import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'brand-blue': '#243355',
                'brand-blue-light': '#5B8DDB',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                slideUp: {
                    from: { transform: 'translateY(100%)' },
                    to: { transform: 'translateY(0)' },
                },
                introIn: {
                    from: { opacity: '0', transform: 'translateY(-12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                colorPulse: {
                    '0%, 100%': { color: '#243355' },
                    '50%': { color: '#5B8DDB' },
                },
            },
            animation: {
                'slide-up': 'slideUp 0.25s ease-out',
                'intro-in': 'introIn 0.45s ease-out forwards',
                'intro-in-delay': 'introIn 0.45s ease-out 0.15s forwards',
                'intro-in-delay2': 'introIn 0.45s ease-out 0.28s forwards',
                'color-pulse': 'colorPulse 3s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}

export default config
