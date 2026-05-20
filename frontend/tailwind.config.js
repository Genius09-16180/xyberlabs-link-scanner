/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg0:    '#07070D',
        bg1:    '#0D0D18',
        bg2:    '#111120',
        bg3:    '#181828',
        bg4:    '#1E1E32',
        deep:   '#292d64',
        cyan:   '#00E5FF',
        violet: '#9B5FFF',
        pink:   '#FF3B8B',
        orange: '#FF7A40',
        neon:   '#00FF99',
        gold:   '#F5C842',
      },
      fontFamily: {
        title: ['"alfarn-2"', 'sans-serif'],
        body:  ['"DM Sans"', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-cyan':  'pulse-cyan 2s ease-in-out infinite',
        'scan-line':   'scan-line 2.5s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'blink':       'blink 1.4s step-end infinite',
        'slide-up':    'slide-up 0.6s cubic-bezier(.16,1,.3,1) forwards',
        'fade-in':     'fade-in 0.5s ease forwards',
      },
      keyframes: {
        'pulse-cyan': {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.4 },
        },
        'scan-line': {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 20px rgba(0,229,255,.3)' },
          '50%':     { boxShadow: '0 0 40px rgba(0,229,255,.6), 0 0 80px rgba(0,229,255,.2)' },
        },
        'blink': {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0 },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
      },
      boxShadow: {
        'glow-cyan':   '0 0 40px rgba(0,229,255,.25), 0 0 80px rgba(0,229,255,.1)',
        'glow-violet': '0 0 40px rgba(155,95,255,.25), 0 0 80px rgba(155,95,255,.1)',
        'glow-pink':   '0 0 40px rgba(255,59,139,.25)',
        'glow-sm':     '0 0 22px rgba(0,229,255,.35)',
      },
    },
  },
  plugins: [],
}
