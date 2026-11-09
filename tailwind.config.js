/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1677FF',
          'blue-hover': '#0958d9',
          'blue-light': '#DCEBFF',
          'blue-subtle': '#EBF3FF',
          navy: '#071426',
          'navy-light': '#0c213d',
          'navy-border': '#15325b',
          black: '#05070B',
          'black-card': '#0b0f19',
          'black-border': '#182234',
          lightBg: '#F5F8FC',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        malayalam: ['"Noto Sans Malayalam"', 'Gayathri', 'Manjari', 'sans-serif'],
        gayathri: ['Gayathri', 'sans-serif'],
        manjari: ['Manjari', 'sans-serif'],
        chilanka: ['Chilanka', 'cursive'],
        anek: ['"Anek Malayalam"', 'sans-serif'],
      },
      boxShadow: {
        'apple-sm': '0 2px 8px -2px rgba(22, 119, 255, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'apple': '0 12px 32px -8px rgba(22, 119, 255, 0.12), 0 4px 16px -4px rgba(7, 20, 38, 0.06)',
        'apple-glow': '0 0 30px -5px rgba(22, 119, 255, 0.35)',
        'apple-dark': '0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'apple-dark-glow': '0 0 40px -8px rgba(22, 119, 255, 0.25), 0 0 0 1px rgba(22, 119, 255, 0.2)',
      },
      backdropBlur: {
        'apple': '20px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-medium': 'floatMedium 6s ease-in-out infinite',
        'float-fast': 'floatFast 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(3deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-2deg)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
