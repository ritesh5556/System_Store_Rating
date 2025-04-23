/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2', // Material UI primary color
          light: '#42a5f5',
          dark: '#1565c0',
        },
        secondary: {
          DEFAULT: '#dc004e', // Material UI secondary color
          light: '#ff4081',
          dark: '#c51162',
        },
      }
    },
  },
  plugins: [],
} 