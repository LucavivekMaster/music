/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        music: {
          c: '#ef4444',
          cSharp: '#f97316',
          d: '#eab308',
          dSharp: '#22c55e',
          e: '#14b8a6',
          f: '#06b6d4',
          fSharp: '#0ea5e9',
          g: '#3b82f6',
          gSharp: '#6366f1',
          a: '#8b5cf6',
          aSharp: '#d946ef',
          b: '#ec4899',
        }
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
