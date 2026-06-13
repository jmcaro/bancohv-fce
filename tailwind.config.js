/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/**/*.ejs',
    './src/public/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        unia: {
          // Colores primarios — Manual de Identidad Visual UA 2024
          blue:          '#143163',  // Azul marino primario
          'blue-light':  '#1D71B8',  // Azul medio (secundario)
          orange:        '#D85819',  // Naranja primario
          'orange-light':'#FF9912',  // Naranja dorado (secundario)
          yellow:        '#F9B233',  // Amarillo dorado (secundario)
          gray:          '#F4F6FA',  // Fondo claro
          'gray-dark':   '#706F6F',  // Gris institucional
          white:         '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Tahoma', 'Candara', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
