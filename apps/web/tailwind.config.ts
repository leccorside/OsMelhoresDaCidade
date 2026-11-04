import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF3B4F",
          dark: "#D91F35",
          crimson: "#ba002a",
          light: "#FFF1F2",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          canvas: "#FCF9F8",
          subtle: "#F8F9FA",
          dim: "#DCD9D9",
          border: "#E5E7EB",
        },
        content: {
          main: "#171717",
          muted: "#777777",
          subtle: "#9CA3AF",
        },
        status: {
          open: "#10B981",
          openBg: "rgba(16, 185, 129, 0.1)",
          featured: "#F59E0B",
          featuredBg: "rgba(245, 158, 11, 0.12)",
          error: "#BA1A1A",
          errorBg: "#FFDAD6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0px 2px 8px -1px rgba(23, 23, 23, 0.04), 0px 1px 3px 0px rgba(23, 23, 23, 0.02)",
        hover: "0px 12px 24px -4px rgba(23, 23, 23, 0.08), 0px 4px 8px -2px rgba(23, 23, 23, 0.03)",
        floating: "0px 20px 32px -6px rgba(23, 23, 23, 0.12), 0px 8px 12px -3px rgba(23, 23, 23, 0.04)",
        modal: "0px 32px 64px -12px rgba(23, 23, 23, 0.24)",
      },
    },
  },
  plugins: [],
};
export default config;

