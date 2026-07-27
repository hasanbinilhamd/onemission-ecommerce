/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "chakra-petch": ["'Chakra Petch'", "sans-serif"],
        "sf-pro-display": ["'SF-Pro-Display'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
