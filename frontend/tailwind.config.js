/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Surfaces — plain CSS vars (no opacity modifier needed)
        'surface-0':        'var(--color-surface-0)',
        'surface-1':        'var(--color-surface-1)',
        'surface-2':        'var(--color-surface-2)',
        'surface-3':        'var(--color-surface-3)',
        'surface-4':        'var(--color-surface-4)',
        'surface-5':        'var(--color-surface-5)',
        'surface-border':   'var(--color-border)',
        'surface-border-2': 'var(--color-border-2)',

        // Text — plain CSS vars
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        'text-faint':     'var(--color-text-faint)',

        // Accent — RGB channel format enables /opacity modifier
        'accent':      ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-accent-rgb), ${opacityValue})`
            : 'var(--color-accent)',
        'accent-hover':   'var(--color-accent-hover)',
        'accent-subtle':  'var(--color-accent-subtle)',
        'accent-muted':   'var(--color-accent-muted)',
        'accent-text':    'var(--color-accent-text)',

        // Semantic — RGB channel format enables /opacity modifier
        'green': ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-green-rgb), ${opacityValue})`
            : 'var(--color-green)',
        'amber': ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-amber-rgb), ${opacityValue})`
            : 'var(--color-amber)',
        'red': ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-red-rgb), ${opacityValue})`
            : 'var(--color-red)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}