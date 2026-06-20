import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // status.ts 등 lib의 동적 색상 클래스가 purge되지 않도록 포함
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#d6336c',
          dark: '#a61e4d',
          light: '#f06595',
        },
      },
    },
  },
  plugins: [],
}

export default config
