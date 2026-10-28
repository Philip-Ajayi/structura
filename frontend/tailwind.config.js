/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: "#101622",
        surfaceBorder: "#1E293B",
        accent: "#00E599",
        accentDim: "rgba(0, 229, 153, 0.15)",
        danger: "#EF4444",
        dangerDim: "rgba(239, 68, 68, 0.15)",
        warning: "#F59E0B"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"]
      }
    },
  },
  plugins: [],
};
