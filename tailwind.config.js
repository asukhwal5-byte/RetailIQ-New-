/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand ramp
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdfff',
          300: '#8eccff',
          400: '#59b0ff',
          500: '#2f8fff',
          600: '#1870f5',
          700: '#145ae0',
          800: '#1749b5',
          900: '#19418f',
          950: '#152957',
        },
        // Accent (teal)
        accent: {
          50: '#ecfdf7',
          100: '#d1faec',
          200: '#a6f3da',
          300: '#6ce7c3',
          400: '#34d3a6',
          500: '#14b88a',
          600: '#079672',
          700: '#087a5d',
          800: '#0c614d',
          900: '#0d5040',
        },
        // Status ramps
        success: {
          50: '#ecfdf3', 100: '#d1fadf', 200: '#a7f3c4', 300: '#6ee7a0',
          400: '#34d27b', 500: '#12b157', 600: '#089144', 700: '#08743a',
          800: '#0a5c31', 900: '#094d2a',
        },
        warning: {
          50: '#fff8eb', 100: '#ffefc6', 200: '#ffdd88', 300: '#ffc44a',
          400: '#ffaa1f', 500: '#f98c0c', 600: '#dd6c02', 700: '#b74a06',
          800: '#94390c', 900: '#7a300d',
        },
        danger: {
          50: '#fef0f2', 100: '#fddce0', 200: '#fbc3ca', 300: '#f79aa6',
          400: '#f06679', 500: '#e23b54', 600: '#c9243e', 700: '#a91b34',
          800: '#8c1a32', 900: '#751a31',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
        'card-lg': '0 8px 24px -8px rgb(16 24 40 / 0.12), 0 2px 6px -2px rgb(16 24 40 / 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-8px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
