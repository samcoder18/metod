/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './blog/**/*.html'],
  theme: {
    extend: {
      colors: {
        background: '#100F0D',
        surface: '#171512',
        raised: '#1D1A16',
        foreground: '#ECE7DE',
        secondary: '#9C968C',
        accent: '#C9A24B',
        'accent-deep': '#8F7331',
        border: '#27231E',
        'on-accent': '#14120F',
      },
      fontFamily: {
        display: ['"Tenor Sans"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Onest', 'system-ui', 'sans-serif'],
      },
    }
  }
}
