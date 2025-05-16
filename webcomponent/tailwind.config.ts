/** @type {import('tailwindcss').Config} */
// import { fontFamily } from "tailwindcss/defaultTheme"
export default {
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
  #map: {
    height: 180px; 
  },
  plugins: [],
};
