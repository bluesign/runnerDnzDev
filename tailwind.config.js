/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        ellipsis: 'ellipsis 2s steps(1, end) infinite',
      },
    },
  },
  plugins: [],
  // Prevent Tailwind from conflicting with Fluent UI
  corePlugins: {
    preflight: false,
  },
}
