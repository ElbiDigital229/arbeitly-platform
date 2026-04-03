/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background:  'hsl(var(--color-bg-raw, 196 89% 14%) / <alpha-value>)',
        foreground:  'hsl(var(--color-fg-raw, 188 10% 95%) / <alpha-value>)',
        card:        'hsl(var(--color-card-raw, 196 80% 18%) / <alpha-value>)',
        'card-foreground': 'hsl(var(--color-fg-raw, 188 10% 95%) / <alpha-value>)',
        border:      'hsl(var(--color-border-raw, 196 40% 22%) / <alpha-value>)',
        primary:     'hsl(var(--color-primary-raw, 188 100% 44%) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--color-primary-fg-raw, 196 89% 14%) / <alpha-value>)',
        secondary:   'hsl(var(--color-secondary-raw, 196 60% 22%) / <alpha-value>)',
        muted:       'hsl(var(--color-muted-raw, 196 20% 55%) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--color-muted-raw, 196 20% 55%) / <alpha-value>)',
        destructive: 'hsl(var(--color-destructive-raw, 0 72% 51%) / <alpha-value>)',
        success:     'hsl(var(--color-success-raw, 152 60% 42%) / <alpha-value>)',
        warning:     'hsl(var(--color-warning-raw, 38 92% 50%) / <alpha-value>)',
        info:        'hsl(var(--color-info-raw, 210 80% 52%) / <alpha-value>)',
        input:       'hsl(196 89% 9% / <alpha-value>)',
        overlay:     'rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        float:     'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
