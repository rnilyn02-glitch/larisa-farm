import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          green: '#2d5a1b',
          'green-light': '#7ab648',
          cream: '#f5f0e8',
          amber: '#f0a500',
          error: '#e74c3c',
          card: '#ffffff',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
