/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      blue: {
        light: "#4f698c",
        DEFAULT: "#293241",
        darker: "#1c222e",
      },
      secondary: {
        DEFAULT: "#3b4452",
      },
      white: "#ffffff",
    },
    plugins: [],
  },
}
