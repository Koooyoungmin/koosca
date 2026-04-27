import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0fbf9",
          100: "#d3f4ee",
          200: "#a8e8de",
          300: "#72d5c8",
          400: "#41baae",
          500: "#3aa393",
          600: "#2d8578",
          700: "#266b61",
          800: "#22554e",
          900: "#1f4641",
        },
        status: {
          study:  "#3aa393",
          outing: "#f59e0b",
          sleep:  "#94a3b8",
          away:   "#ef4444",
        },
        accent: {
          blue:  "#6a9bcc",
          green: "#3aa393",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px 0 rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
