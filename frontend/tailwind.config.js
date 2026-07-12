/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          DEFAULT: '#a855f7', // Premium Lavender/Purple
        },
        // We map standard slate values to natural light-mode counterparts
        // so the colors feel premium, soft, and readable.
        slate: {
          50: '#1e293b',
          100: '#1e293b', // Natural Charcoal dark text (instead of harsh black)
          200: '#334155',
          300: '#475569',
          400: '#475569', // Muted text
          500: '#64748b',
          600: '#94a3b8',
          700: '#cbd5e1',
          800: '#e2e8f0', // Border lines
          850: '#f8fafc', // Alternating bg
          900: '#ffffff', // Card container bg (Pure White)
          950: '#f6f8fb', // Soft natural page layout bg
        }
      },
    },
  },
  plugins: [],
}

