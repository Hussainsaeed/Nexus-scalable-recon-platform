import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg0: '#05070b',
          bg1: '#071017',
          line: 'rgba(94,255,169,0.25)',
          neon: '#5effa9',
          neon2: '#00f5d4',
          danger: '#ff4d6d',
          warn: '#ffcc66'
        }
      },
      boxShadow: {
        glow: '0 0 30px rgba(94,255,169,0.35)'
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(94,255,169,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(94,255,169,0.06) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;

