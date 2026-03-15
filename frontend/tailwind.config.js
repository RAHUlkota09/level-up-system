/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind which files to scan for class names
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Solo Leveling inspired color palette
      colors: {
        system: {
          black: '#050510',
          dark: '#0a0a1a',
          panel: '#0d0d2b',
          border: '#1a1a4e',
          purple: '#6c2bd9',
          'purple-light': '#8b5cf6',
          blue: '#0066ff',
          'blue-light': '#3d9fff',
          cyan: '#00d4ff',
          gold: '#ffd700',
          red: '#ff3333',
          green: '#00ff88',
          orange: '#ff6600',
        }
      },
      fontFamily: {
        // Rajdhani gives that sharp, futuristic game UI look
        system: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(108, 43, 217, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.5)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-red': '0 0 20px rgba(255, 51, 51, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 2s linear infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
}
