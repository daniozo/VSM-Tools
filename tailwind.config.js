/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'gray': {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d1d1d1',
          400: '#a3a3a3',
          500: '#888888',
          600: '#666666',
          700: '#404040',
          800: '#262626',
          900: '#111111',
        },
        white: '#ffffff',
        // Couleurs fonctionnelles
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f5f5f5',
        },
        text: {
          primary: '#111111',
          secondary: '#666666',
        },
        border: {
          DEFAULT: '#e5e5e5',
          subtle: '#ebebeb',
        },
        accent: {
          DEFAULT: '#262626',
          hover: '#404040',
        },
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
      },
      transitionDuration: {
        quick: '150ms',
        normal: '250ms',
      },
    },
  },
  plugins: [],
}