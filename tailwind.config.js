/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0a",
        surface: "#111111",
        elevated: "#1a1a1a",
        border: "#2a2a2a",
        primary: "#22c55e",
        "primary-hover": "#16a34a",
        "primary-tint": "#052e16",
        "text-main": "#f5f5f5",
        "text-muted": "#6b7280",
        "text-hint": "#4b5563",
        "loss-bg": "#2d0a0a",
        "loss-text": "#f87171",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}