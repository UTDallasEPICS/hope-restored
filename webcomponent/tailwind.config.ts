/** @type {import('tailwindcss').Config} */
import { fontFamily } from "tailwindcss/defaultTheme"
module.exports = {
  mode: "jit",
  content: [
    "./src/components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./src/views/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./index.html",
    "./src/app.vue",
    "./error.vue",
  ],
  screens: {
    sm: "480px",
    md: "768px",
    lg: "976px",
    xl: "1440px",
  },
  theme: {
    extend: {
      colors: {
        "hrm-green": "#618930",
        "hrm-dark-green": "#15461F",
        "black-neutral": "#1A1A1A",
        "white-neutral": "#F7F7F7",
      },
      fontFamily: {
        Roboto: ["Roboto", "sans-serif", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
