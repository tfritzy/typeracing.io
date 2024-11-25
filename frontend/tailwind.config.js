/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        pulseFull: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      boxShadow: {
        centered: "0 0 3px 5px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-full": "pulseFull 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        "base-100": "var(--base-100)",
        "base-200": "var(--base-200)",
        "base-300": "var(--base-300)",
        "base-400": "var(--base-400)",
        "base-500": "var(--base-500)",
        "base-600": "var(--base-600)",
        "base-700": "var(--base-700)",
        "base-800": "var(--base-800)",
        "base-900": "var(--base-900)",
        accent: "var(--accent)",
        "accent-600": "var(--accent-600)",
        "accent-800": "var(--accent-800)",
        "accent-dark": "var(--accent-dark)",
        "accent-200": "var(--accent-200)",
        "white-900": "var(--white-900)",
        "error-color": "var(--error-color)",
        "shadow-color": "var(--shadow-color)",
      },
    },
  },
  plugins: [],
};
