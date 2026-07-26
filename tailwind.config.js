/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './privacy.html', './404.html', './blog/**/*.html'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--c-background) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        foreground: 'rgb(var(--c-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-deep': 'rgb(var(--c-accent-deep) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        'on-accent': 'rgb(var(--c-on-accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Tenor Sans"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Onest', 'system-ui', 'sans-serif'],
      },
    }
  }
}
