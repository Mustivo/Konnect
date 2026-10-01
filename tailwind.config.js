/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 30px rgba(11, 13, 11, 0.18)",
      },
      colors: {
        konnect: {
          dark: "#0b0d0b",
          olive: "#314d2b",
          sage: "#dfe9d4",
        },
      },
    },
  },
  plugins: [],
}

