/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe8ff",
          500: "#1f66e5",
          600: "#1b5ad5",
          700: "#184ac2",
          800: "#123b9b"
        }
      }
    }
  },
  plugins: []
};
