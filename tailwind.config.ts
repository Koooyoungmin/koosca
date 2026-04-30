import type { Config } from "tailwindcss";

const config: Config = {
  important: true,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        status: {
          study:  "#3b82f6",
          outing: "#f59e0b",
          sleep:  "#94a3b8",
          away:   "#ef4444",
        },
      },
      fontFamily: {
        serif: ["'Noto Serif KR'", "Georgia", "serif"],
        sans: ["'Noto Sans KR'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px 0 rgba(30,58,138,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
