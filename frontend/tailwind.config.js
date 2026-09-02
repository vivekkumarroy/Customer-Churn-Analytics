/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          bg2: 'var(--color-bg2)',
          card: 'var(--color-card)',
          'card-hover': 'var(--color-card-hover)',
          border: 'var(--color-border)',
          accent1: 'var(--color-accent1)',
          accent2: 'var(--color-accent2)',
          text1: 'var(--color-text1)',
          text2: 'var(--color-text2)',
          muted: 'var(--color-muted)',
          high: 'var(--color-high)',
          medium: 'var(--color-medium)',
          low: 'var(--color-low)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
