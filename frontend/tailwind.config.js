/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        georgia: ["Monaco", "Menlo", "Consolas"],
      },
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
        white: "#ffffff",
      },
    },
  },
  plugins: [],
};
