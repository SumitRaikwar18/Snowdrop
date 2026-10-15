/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FCFDFC",
          100: "#F8FAF8",
          200: "#F1F5F1",
          300: "#E6ECE6",
        },
        navy: {
          800: "#1E293B",
          900: "#132238",
          950: "#0A1220",
        },
        snowblue: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        avax: "#E84142",
      },
      fontFamily: {
        sans: [
          "var(--font-outfit)",
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(19, 34, 56, 0.05), 0 2px 6px -1px rgba(19, 34, 56, 0.03)",
        card: "0 10px 30px -4px rgba(19, 34, 56, 0.07), 0 4px 12px -2px rgba(19, 34, 56, 0.03)",
        elevated: "0 20px 45px -10px rgba(19, 34, 56, 0.12), 0 8px 16px -4px rgba(19, 34, 56, 0.04)",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
