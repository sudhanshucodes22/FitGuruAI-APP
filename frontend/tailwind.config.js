/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#39FF14',
          container: 'rgba(57, 255, 20, 0.1)',
        },
        background: '#000000',
        surface: '#0d0d0d',
        'surface-container': '#151515',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#8e8e93',
        error: '#ff3b30',
      },
      fontFamily: {
        display: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
