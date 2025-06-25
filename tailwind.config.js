/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D5016',
        secondary: '#7CB342',
        accent: '#FF6F00',
        surface: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#EEEEEA',
          300: '#E0E0DC',
          400: '#CCCCCA',
          500: '#B8B8B5',
          600: '#9A9A95',
          700: '#7C7C78',
          800: '#5E5E5B',
          900: '#40403E'
        },
        background: '#F5F5F0',
        success: '#4CAF50',
        warning: '#FFA726',
        error: '#EF5350',
        info: '#29B6F6'
      },
      fontFamily: { 
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['DM Sans', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'topographic': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23F5F5F0\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"%3E%3Cpath d=\"M0 20c0-11 9-20 20-20s20 9 20 20-9 20-20 20S0 31 0 20z\"/%3E%3C/g%3E%3C/svg%3E')"
      }
    },
  },
  plugins: [],
}