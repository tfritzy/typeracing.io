/** @type {import('tailwindcss').Config} */
export default {
  content: ["./english.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "base-100": "var(--base-100)",
        "base-200": "var(--base-200)",
        "base-300": "var(--base-300)",
        "base-400": "var(--base-400)",
        "base-500": "var(--base-500)",
        "base-600": "var(--base-600)",
        "base-700": "var(--base-700)",
        "base-800": "var(--base-800)",
        accent: "var(--accent)",
        error: "var(--error)",
      },
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
