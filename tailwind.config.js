/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FDF8F3', dark: '#F5EDE4' },
        brown: { DEFAULT: '#A67C52', dark: '#8B6542', light: '#C9A882' },
        indigo: { DEFAULT: '#4A3F8F', dark: '#372F6B', light: '#E7E3F8' },
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
          doneGreen: { bg: '#E4EDE5', fg: '#2F5233' },
        },
        // Darussalam module tokens — deep tropical green on cream
        darussalam: {
          green: { DEFAULT: '#2F4A32', dark: '#1F331F', light: '#4F7A52' },
          bg: '#F7F2E9',
          tile: '#EFEAE0',
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
        arabic: ['Amiri', 'serif'],
      },
      fontSize: {
        'display-title': ['44px', { fontWeight: '400', letterSpacing: '-0.5px', lineHeight: '1.15' }],
        'page-title': ['34px', { fontWeight: '400', letterSpacing: '-0.4px', lineHeight: '1.2' }],
        'section-heading': ['23px', { fontWeight: '600', lineHeight: '1.3' }],
        'home-section-heading': ['18px', { fontWeight: '600', lineHeight: '1.3' }],
        'book-title': ['21px', { fontWeight: '600', lineHeight: '1.3' }],
        'amount-lg': ['28px', { fontWeight: '700' }],
        'amount-md': ['20px', { fontWeight: '700' }],
        'amount-sm': ['16px', { fontWeight: '700' }],
        body: ['16px', { fontWeight: '400' }],
        metadata: ['14px', { fontWeight: '400' }],
        caption: ['12px', { fontWeight: '400' }],
        'caption-md': ['14px', { fontWeight: '400' }],
        button: ['16px', { fontWeight: '500' }],
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
