/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: 
[
  "./src/**/*.{js,ts,jsx,tsx}",
 "./app/**/*.{js,ts,jsx,tsx}"
],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}