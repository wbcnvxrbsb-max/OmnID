/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        omn: {
          bg: "#09090f",
          "bg-light": "#0e0e16",
          surface: "#13131d",
          "surface-light": "#1a1a28",
          border: "#1f1f30",
          "border-light": "#2a2a42",
          text: "#7c819a",
          "text-light": "#a0a4b8",
          heading: "#eeeef0",
          primary: "#3b82f6",
          "primary-light": "#60a5fa",
          "primary-dark": "#2563eb",
          accent: "#38bdf8",
          "accent-light": "#7dd3fc",
          success: "#22c55e",
          danger: "#ef4444",
          pro: "#d946ef",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
