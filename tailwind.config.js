/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a0a0b',
          card: '#131314',
          card2: '#1b1b1d',
          border: '#2a2a2d',
          text: '#f2f2f2',
          muted: '#8c8c93',
        },
        yellow: {
          accent: '#f4ef5a',
          hover: '#e2dd4e',
        },
        accent: {
          green: '#3ddc84',
          greenBg: '#12351f',
          red: '#ff5252',
          blue: '#3b9cff',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
