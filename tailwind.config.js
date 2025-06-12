/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
            extend: {
      colors: {
        'primary': '#1C5D66',
        'secondary': '#E0994B',
      },
            },
          },
  plugins: [],
}
