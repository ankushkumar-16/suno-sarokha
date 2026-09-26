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
        paper:   "var(--color-paper)",
        ink:     "var(--color-ink)",
        muted:   "var(--color-muted)",
        faint:   "var(--color-faint)",
        rule:    "var(--color-rule)",
        warm:    "var(--color-warm)",
      },
    },
  },
  plugins: [],
};
