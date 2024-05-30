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
      animation: {
        "pulse-full": "pulseFull 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        accent: "var(--accent)",
        "accent-100": "var(--accent-100)",
        "accent-200": "var(--accent-200)",
        "white-900": "var(--white-900)",
        "background-color": "var(--background-color)",
        "neutral-color": "var(--neutral-color)",
        "border-color": "var(--border-color)",
        "error-color": "var(--error-color)",
      },
    },
  },
  plugins: [],
};
