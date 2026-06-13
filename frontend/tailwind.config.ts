import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        surface: '#12121A',
        elevated: '#1C1C28',
        primary: '#7C5CFC',
        'primary-light': '#947DFF',
        secondary: '#00E5FF',
        error: '#FF4D6D',
        success: '#00D68F',
        'primary-border': '#2A2A3D',
        'text-primary': '#F0F0FF',
        'text-secondary': '#8888AA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'sound-wave': {
          '0%, 100%': {
            transform: 'scaleY(0.45)',
            opacity: '0.25',
            boxShadow: '0 0 0 rgba(168, 85, 247, 0)',
          },
          '50%': {
            transform: 'scaleY(1.8)',
            opacity: '1',
            boxShadow: '0 0 12px rgba(168, 85, 247, 0.85), 0 0 24px rgba(34, 211, 238, 0.45)',
          },
        },
        heartbeat: {
          from: {
            transform: 'scale(1)',
            transformOrigin: 'center center',
            animationTimingFunction: 'ease-out',
          },
          '10%': {
            transform: 'scale(0.91)',
            animationTimingFunction: 'ease-in',
          },
          '17%': {
            transform: 'scale(0.98)',
            animationTimingFunction: 'ease-out',
          },
          '33%': {
            transform: 'scale(0.87)',
            animationTimingFunction: 'ease-in',
          },
          '45%': {
            transform: 'scale(1)',
            animationTimingFunction: 'ease-out',
          },
        },
      },
      animation: {
        'sound-wave': 'sound-wave 1.8s ease-in-out infinite',
        heartbeat: 'heartbeat 1.5s ease-in-out infinite both',
      },
    },
  },
  plugins: [],
};

export default config;
