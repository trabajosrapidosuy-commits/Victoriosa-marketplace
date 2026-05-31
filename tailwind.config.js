/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        victoriosa: {
          primary: '#6B21A8',    // Purple
          secondary: '#EC4899',  // Pink
          accent: '#F59E0B',     // Amber
          light: '#F3E8FF',      // Light purple
        }
      }
    },
  },
  plugins: [],
}
