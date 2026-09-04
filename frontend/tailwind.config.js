/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#060D1A',
          850: '#0B1528',
          800: '#101F3C',
          750: '#162A50',
          700: '#1E3A6E',
          600: '#2E5496',
        },
        cyber: {
          blue: '#0284C7',
          cyan: '#00E5FF',
          glow: '#00F0FF',
          emerald: '#00FF9D',
          amber: '#FFB800',
          red: '#FF0055',
        },
        isro: {
          saffron: '#FF7700',
          gold: '#E5A93B',
          cyan: '#00F0FF',
          green: '#00FF9D',
          alert: '#FF0055',
        },
        telemetry: {
          safe: '#00FF9D',
          monitor: '#FFB800',
          reject: '#FF0055',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        share: ['"Share Tech Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Share Tech Mono"', 'ui-monospace', 'monospace'],
        sans: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 0, 85, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 0, 85, 0.9)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
