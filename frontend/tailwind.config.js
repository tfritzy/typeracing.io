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
        main: "#dfe3e8",
        secondary: "#dfe3e888",
        tertiary: "#dfe3e866",
        accent: "#bfdbfe",
        "white-900": "var(--white-900)",
        "background-color": "var(--background-color)",
        "neutral-color": "var(--neutral-color)",
        "border-color": "var(--border-color)",
      },
    },
  },
  plugins: [],
};
