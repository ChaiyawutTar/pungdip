/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pangdip: {
                    orange: '#FFAD40',
                    brown: '#4A2C2A',
                    custard: '#F6E58D',
                    'orange-light': '#FFD699',
                    'brown-light': '#6B4423',
                }
            },
            fontFamily: {
                display: ['Fredoka', 'Kanit', 'sans-serif'],
                body: ['Kanit', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'bounce-slow': 'bounce 2s infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'wiggle': 'wiggle 0.5s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(255, 173, 64, 0.5)',
                    },
                    '50%': {
                        boxShadow: '0 0 40px rgba(255, 173, 64, 0.8)',
                    },
                },
                'wiggle': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
