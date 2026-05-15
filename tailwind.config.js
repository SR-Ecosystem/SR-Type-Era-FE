/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        primary:  { DEFAULT: "#5b21b6", light: "#7c3aed", dark: "#4c1d95", foreground: "#ffffff" },
        accent:   { DEFAULT: "#0d9488", foreground: "#ffffff" },
        success:  "#16a34a",
        error:    "#dc2626",
        warning:  "#d97706",
        gold:     "#d97706",
        silver:   "#94a3b8",
        bronze:   "#b45309",
      },
      animation: {
        shake: "shake 0.3s ease",
        "pulse-caret": "pulse-caret 1s step-end infinite",
        "fade-up": "fadeUp 0.4s ease forwards",
        "count-pop": "countPop 0.4s cubic-bezier(.175,.885,.32,1.275)",
      },
      keyframes: {
        shake: { "0%,100%": { transform: "translateX(0)" }, "20%,60%": { transform: "translateX(-6px)" }, "40%,80%": { transform: "translateX(6px)" } },
        "pulse-caret": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        fadeUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        countPop: { from: { transform: "scale(1.8)", opacity: 0 }, to: { transform: "scale(1)", opacity: 1 } },
      },
    },
  },
  plugins: [],
};
