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
          950: '#070B14',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#131D31',
          750: '#18243C',
          700: '#1E293B',
          600: '#334155',
        },
        cyber: {
          blue: '#0284C7',
          cyan: '#38BDF8',
          glow: '#00F0FF',
        },
        telemetry: {
          safe: '#10B981',
          monitor: '#F59E0B',
          reject: '#EF4444',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
