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
          50: '#f0f4ff',
          100: '#e1e9ff',
          200: '#c7d7ff',
          300: '#9db8ff',
          400: '#6b8eff',
          500: '#3b5eff',
          600: '#253beb',
          700: '#1d29d4',
          800: '#1821ad',
          900: '#1b228a',
          DEFAULT: '#253beb', // Royal SaaS Blue
        },
        slate: {
          850: '#151f32',
          950: '#0b111e',
        }
      },
    },
  },
  plugins: [],
}
