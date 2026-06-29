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
        // 소프트 럭셔리 / 에디토리얼 — 인스타 피드 톤(뮤트 모카로즈 + 토프 + 크림)
        brand: {
          DEFAULT: '#9c7a70', // 모카 로즈 (메인 액션)
          dark: '#7e6058',
          light: '#cbb0a8',
        },
        cream: {
          DEFAULT: '#f7f2ea', // 앱 배경 (따뜻한 아이보리)
          dark: '#ece3d4',
        },
        blush: {
          DEFAULT: '#e9d6d0', // 더스티 블러시 (소프트 핑크 악센트)
          dark: '#cda69d',
        },
        taupe: {
          DEFAULT: '#a99a87', // 토프 (뉴트럴 악센트)
          dark: '#8a7c6a',
        },
        ink: '#3d352e', // 따뜻한 차콜 (본문 텍스트)
      },
    },
  },
  plugins: [],
}

export default config
