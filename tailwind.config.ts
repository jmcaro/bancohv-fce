import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/views/**/*.ejs'],
  theme: {
    extend: {
      colors: {
        unia: {
          blue:       '#003087',
          'blue-light': '#0047BF',
          gold:       '#C8A951',
          'gold-light': '#E5C97A',
          white:      '#FFFFFF',
          gray:       '#F4F6FA',
          'gray-dark': '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
