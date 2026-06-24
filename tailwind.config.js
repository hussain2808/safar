/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
