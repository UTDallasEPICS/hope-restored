/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");
module.exports = {
  content: [],
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
}

