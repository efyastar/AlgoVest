/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        border: "var(--color-border)",
        primary: "#22c55e",
        "primary-hover": "#16a34a",
        "primary-tint": "var(--color-primary-tint)",
        "text-main": "var(--color-text-main)",
        "text-muted": "var(--color-text-muted)",
        "text-hint": "var(--color-text-hint)",
        "loss-bg": "var(--color-loss-bg)",
        "loss-text": "#f87171",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
}