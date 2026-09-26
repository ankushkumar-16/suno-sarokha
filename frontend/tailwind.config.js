/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "suno-dark": "#0a0a0a",
        "suno-card": "#161616",
        "suno-border": "#262626",
        "suno-muted": "#a3a3a3",
        "suno-text": "#fafafa",
        "suno-danger": "#ef4444",
        "suno-warning": "#f59e0b",
        "suno-safe": "#22c55e",
        "suno-accent": "#8b5cf6",
      },
    },
  },
  plugins: [],
}
