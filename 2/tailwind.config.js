/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        focus: '#FF6B6B',
        break: '#4ECDC4',
      },
    },
  },
  plugins: [],
}
