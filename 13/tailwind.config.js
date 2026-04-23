/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'gold-light': '#FFD700',
        'gold-dark': '#B8860B',
        navy: '#0A1628',
        'navy-light': '#162A46',
        'navy-dark': '#060E18',
      },
    },
  },
  plugins: [],
}
