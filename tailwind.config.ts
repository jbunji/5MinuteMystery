import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        noir: {
          50: '#fafafa',
          100: '#f0f0f0',
          200: '#d9d9d9',
          300: '#bfbfbf',
          400: '#8c8c8c',
          500: '#595959',
          600: '#404040',
          700: '#262626',
          800: '#1a1a1a',
          900: '#0d0d0d',
          950: '#000000',
        },
        blood: {
          500: '#8b0000',
          600: '#660000',
          700: '#4d0000',
        },
        parchment: {
          50: '#fdf8f0',
          100: '#f9f0dd',
          200: '#f0ddb5',
          300: '#e6c885',
          400: '#dbb054',
          500: '#cc9633',
        },
        evidence: {
          primary: '#d4af37',
          secondary: '#c0c0c0',
          danger: '#8b0000',
        }
      },
      fontFamily: {
        'noir': ['Playfair Display', 'serif'],
        'detective': ['Courier Prime', 'monospace'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "typewriter": "typewriter 2s steps(40) 1s forwards",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "typewriter": {
          from: { width: "0" },
          to: { width: "100%" },
        },
      },
      backgroundImage: {
        'noir-gradient': 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
        'evidence-glow': 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
        'mystery-fog': 'radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'noir': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'evidence': '0 0 20px rgba(212, 175, 55, 0.3)',
        'danger': '0 0 30px rgba(139, 0, 0, 0.5)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config