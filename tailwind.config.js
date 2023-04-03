/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        blue: {
          3880: '#3880ff'
        }
      }
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')
    , require('@tailwindcss/forms')
    , require('@tailwindcss/line-clamp')
    , require('@tailwindcss/typography')
  ],
};
