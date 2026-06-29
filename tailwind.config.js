/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F19',
        'midnight-slate': '#111827',
        'coal-black': '#020617',
        'kinetic-cyan': '#06B6D4',
        'overdrive-amber': '#F59E0B',
        'overdrive-crimson': '#EF4444',
        'cyber-emerald': '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite',
        'glow-crimson': 'glowCrimson 1.5s ease-in-out infinite',
        'border-flow': 'borderFlow 4s linear infinite',
        'scanline-flow': 'scanlineFlow 10s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.2), 0 0 20px rgba(6, 182, 212, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)' },
        },
        glowCrimson: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(239, 68, 68, 0.2), 0 0 20px rgba(239, 68, 68, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
