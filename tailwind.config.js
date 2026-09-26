/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ---------------------------------------------------------------
  // Safelist — gift_card_designs.gradient values (src/services/
  // giftCardService.js -> getGiftCardDesigns()) are fetched from Supabase
  // at runtime, so the JIT scanner never sees these literal class names in
  // source and would otherwise purge them. Extend this list if a new gift
  // card design is added with a gradient combination not already covered.
  // ---------------------------------------------------------------
  safelist: [
    'from-[#232f3e]', 'to-[#131921]',
    'from-amber-500', 'from-amber-400',
    'to-yellow-500', 'to-orange-500',
    'from-gray-400', 'to-gray-600',
    'from-slate-700', 'from-slate-500',
    'to-slate-900', 'to-slate-700',
    'from-orange-400',
    'to-rose-500',
    'from-emerald-500', 'from-emerald-600',
    'to-teal-600', 'to-green-600', 'to-green-700',
    'from-sky-400',
    'to-blue-500', 'to-blue-600',
    'from-pink-500', 'from-pink-400',
    'from-fuchsia-500', 'from-purple-400',
    'to-purple-600', 'to-fuchsia-500',
    'from-blue-500',
    'to-indigo-600',
    'from-cyan-500',
  ],
  theme: {
    extend: {
      // ---------------------------------------------------------------
      // AVENZO DESIGN SYSTEM — color tokens
      // Warm, editorial palette: bone (background), stone (secondary
      // surfaces/borders), charcoal (text), brass (accent, used sparingly).
      // These are additive namespaces — they do not touch Tailwind's
      // default gray/yellow/etc. scales, so existing components are
      // unaffected until they're migrated to the new tokens.
      // ---------------------------------------------------------------
      colors: {
        bone: {
          50: '#FEFDFB',
          100: '#FAF7F1',
          200: '#F5EFE4',
          300: '#EEE5D3',
          400: '#E4D7BE',
          500: '#D6C4A3',
          600: '#BFA97F',
          700: '#9C8760',
          800: '#7A684A',
          900: '#5C4E38',
        },
        stone: {
          50: '#F9F7F4',
          100: '#F1ECE4',
          200: '#E5DDD1',
          300: '#D6CABA',
          400: '#B9AA95',
          500: '#9C8B74',
          600: '#7D6E5A',
          700: '#5F5344',
          800: '#453C31',
          900: '#2C2620',
        },
        charcoal: {
          50: '#F5F4F2',
          100: '#E7E4E0',
          200: '#C9C3BB',
          300: '#A9A199',
          400: '#857C72',
          500: '#665D53',
          600: '#4D453C',
          700: '#362F28',
          800: '#251F1A',
          900: '#1B1714',
        },
        brass: {
          50: '#FAF3E4',
          100: '#F3E4C2',
          200: '#E8CD8F',
          300: '#D9B565',
          400: '#C79D46',
          500: '#AD8232',
          600: '#8C6928',
          700: '#6B4F1F',
          800: '#4A3717',
          900: '#2E220F',
        },
        // Functional colors, desaturated to sit comfortably in the warm palette.
        // Use sparingly — status/feedback only, never as decoration.
        success: { 50: '#EEF2EA', 500: '#5C7A54', 700: '#43593D' },
        warning: { 50: '#FBF1E0', 500: '#B8863B', 700: '#8A652B' },
        error: { 50: '#F6E9E6', 500: '#A6483A', 700: '#7C352A' },
        info: { 50: '#E9F0F2', 500: '#4A6B7A', 700: '#37505C' },
      },

      // ---------------------------------------------------------------
      // Typography
      // Fraunces = expressive/editorial display type
      // Inter = UI/body text (also overrides the default `sans` stack)
      // JetBrains Mono = technical/metadata contexts only
      // ---------------------------------------------------------------
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      // Named hierarchy — pairs a size with the line-height/tracking that
      // makes it read well at that scale. Use with font-display or font-sans.
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display': ['3.5rem', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        'display-sm': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'heading-page': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-section': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'heading-sub': ['1.125rem', { lineHeight: '1.4' }],
        // NOTE: these are named `av-*` (rather than e.g. `body-sm`) so the
        // generated utility (`text-av-body-sm`) never collides with the
        // identically-named `.text-body-sm` component class in index.css
        // that @apply's it — a same-name utility + component class is a
        // circular @apply as soon as anything makes Tailwind emit it.
        'av-body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'av-body': ['1rem', { lineHeight: '1.6' }],
        'av-body-sm': ['0.875rem', { lineHeight: '1.55' }],
        'av-label': ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        'av-caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'av-price-lg': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'av-price': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        'av-metadata': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },

      // ---------------------------------------------------------------
      // Spacing — gap-fillers and named section rhythm for generous,
      // editorial layouts. Additive only; the default scale is untouched.
      // ---------------------------------------------------------------
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        'section-sm': '4rem',
        'section': '6rem',
        'section-lg': '8rem',
        'section-xl': '10rem',
      },

      // ---------------------------------------------------------------
      // Shadows — soft, warm-tinted elevation. Deliberately restrained;
      // named (not numbered) so they don't collide with Tailwind's
      // default shadow-sm/md/lg scale used by existing components.
      // ---------------------------------------------------------------
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(28, 23, 17, 0.04)',
        soft: '0 2px 10px -2px rgba(28, 23, 17, 0.08)',
        card: '0 6px 20px -6px rgba(28, 23, 17, 0.12)',
        lifted: '0 16px 40px -12px rgba(28, 23, 17, 0.18)',
        popover: '0 12px 32px -8px rgba(28, 23, 17, 0.16), 0 2px 8px -2px rgba(28, 23, 17, 0.08)',
        'focus-ring': '0 0 0 3px rgba(173, 130, 50, 0.35)',
      },

      // ---------------------------------------------------------------
      // Motion — durations/easings for a restrained, premium feel.
      // Named to avoid colliding with Tailwind's numeric duration scale.
      // ---------------------------------------------------------------
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
        slower: '480ms',
      },
      transitionTimingFunction: {
        'avenzo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'avenzo-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'avenzo-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
        },
        bump: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.22)' },
          '65%': { transform: 'scale(0.94)' },
          '100%': { transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up': 'fadeInUp 420ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'toast-in': 'toastIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'toast-out': 'toastOut 200ms cubic-bezier(0.7, 0, 0.84, 0) both',
        bump: 'bump 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        marquee: 'marquee 34s linear infinite',
      },
    },
  },
  plugins: [],
}
