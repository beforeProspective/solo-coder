/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366f1',
        'secondary': '#8b5cf6',
        'accent': '#ec4899',
        'weather-blue': '#3b82f6',
        'weather-green': '#10b981',
        'weather-orange': '#f59e0b',
        'weather-red': '#ef4444',
        'weather-purple': '#8b5cf6',
      },
    },
  },
  plugins: [],
}
