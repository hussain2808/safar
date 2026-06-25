/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FDF8F3', dark: '#F5EDE4' },
        brown: { DEFAULT: '#A67C52', dark: '#8B6542', light: '#C9A882' },
        text: { primary: '#3D2E1F', secondary: '#8C7B6B', muted: '#B0A090' },
        card: { bg: '#FEFCF9', border: '#F0E6D9' },
        icon: { bg: '#F3EBE0' },
        badge: { bg: '#EFEBE5' },
        gold: '#C9A042',
        accent: {
          orange: { bg: '#FBE7D8', fg: '#C2703D' },
          green: { bg: '#E1EFE1', fg: '#4F8A56' },
          purple: { bg: '#EAE6F5', fg: '#7B6FB0' },
          pink: { bg: '#FBE3E8', fg: '#C26B86' },
          blue: { bg: '#E3EAF7', fg: '#5C7BB0' },
        },
        // Hisaab module tokens (CSS-variable based, see .hisaab-root / index.css)
        bg: {
          primary: 'var(--color-bg-primary)',
          card: 'var(--color-bg-card)',
          icon: 'var(--color-bg-icon)',
          hover: 'var(--color-bg-hover)',
          overlay: 'var(--color-bg-overlay)',
        },
        hisaabText: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          placeholder: 'var(--color-text-placeholder)',
        },
        hisaabAccent: {
          positive: 'var(--color-accent-positive)',
          positiveSoft: 'var(--color-accent-positive-soft)',
          negative: 'var(--color-accent-negative)',
          negativeSoft: 'var(--color-accent-negative-soft)',
          button: 'var(--color-accent-button)',
          buttonText: 'var(--color-accent-buttonText)',
        },
        hisaabBorder: {
          light: 'var(--color-border-light)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'heading-1': ['36px', { fontWeight: '500', letterSpacing: '-0.6px' }],
        'heading-2': ['24px', { fontWeight: '500' }],
        'amount-lg': ['28px', { fontWeight: '500' }],
        'amount-md': ['20px', { fontWeight: '500' }],
        body: ['16.5px', { fontWeight: '600' }],
        caption: ['13px', { fontWeight: '400' }],
        'caption-md': ['14.5px', { fontWeight: '400' }],
      },
      borderRadius: {
        card: '22px',
        button: '18px',
        icon: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,26,15,0.04), 0 8px 20px -12px rgba(30,26,15,0.12)',
        button: '0 10px 24px -8px rgba(30,26,15,0.5)',
      },
    },
  },
  plugins: [],
};
