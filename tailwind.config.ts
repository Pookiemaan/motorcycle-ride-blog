import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}','./lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: '#050505', panel: 'rgba(255,255,255,0.06)', line: 'rgba(255,255,255,0.12)', accent: '#d4af37' },
      boxShadow: { glow: '0 0 40px rgba(212,175,55,0.12)' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], serif: ['Cormorant Garamond', 'Georgia', 'serif'] },
    },
  },
  plugins: [],
}
export default config
