/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  resolve: {
    fallback: {
      "stream": false
    }
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#6A5ACD',
          dark: '#483D8B'
        },
        background: {
          light: '#F4F4F4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'auth-card': '0 4px 15px rgba(106, 90, 205, 0.2)'
      }
    },
  },
  plugins: [],
  
}

