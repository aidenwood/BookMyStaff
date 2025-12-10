/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Bold & Minimal Color Palette
        cream: '#fffcf2',
        lightgray: '#ccc5b9',
        darkgray: '#403d39',
        charcoal: '#252422',
        orange: '#eb5e28',
        
        // Semantic colors
        primary: {
          50: '#fef7f0',
          100: '#fdede1',
          200: '#fad8c3',
          300: '#f6c2a4',
          400: '#f3ad86',
          500: '#eb5e28',
          600: '#d34d1f',
          700: '#bb3d16',
          800: '#a22c0d',
          900: '#8a1c04',
        },
        gray: {
          50: '#fffcf2',
          100: '#f5f2e8',
          200: '#ccc5b9',
          300: '#a8a095',
          400: '#847b71',
          500: '#403d39',
          600: '#36332f',
          700: '#2c2925',
          800: '#252422',
          900: '#1a1918',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 25px rgba(0, 0, 0, 0.1)',
        'hard': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}