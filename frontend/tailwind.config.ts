import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        saraban: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["var(--font-vazirmatn)", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        sarabanTheme: {
          "primary": "#0284c7",
          "secondary": "#0d9488",
          "accent": "#f59e0b",
          "neutral": "#1e293b",
          "base-100": "#ffffff",
          "info": "#38bdf8",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "light",
    ],
  },
};
export default config;
