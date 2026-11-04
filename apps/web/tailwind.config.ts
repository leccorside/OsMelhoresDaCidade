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
        primary: {
          DEFAULT: "#FF3B4F",
          container: "#E1223D",
          fixed: "#FFDAD9",
          "fixed-dim": "#FFB3B2",
        },
        "on-primary": "#FFFFFF",
        "on-primary-container": "#FFFBFF",
        "on-primary-fixed": "#410008",
        "on-primary-fixed-variant": "#92001F",
        secondary: {
          DEFAULT: "#BB0025",
          container: "#E02639",
          fixed: "#FFDAD8",
          "fixed-dim": "#FFB3B0",
        },
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#FFFBFF",
        "on-secondary-fixed": "#410007",
        "on-secondary-fixed-variant": "#92001B",
        tertiary: {
          DEFAULT: "#825100",
          container: "#A36700",
          fixed: "#FFDDB8",
          "fixed-dim": "#FFB95F",
        },
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#FFFBFF",
        "on-tertiary-fixed": "#2A1700",
        "on-tertiary-fixed-variant": "#653E00",
        surface: {
          DEFAULT: "#FCF9F8",
          bright: "#FCF9F8",
          dim: "#DCD9D9",
          canvas: "#FCF9F8",
          subtle: "#F8F9FA",
          border: "#E5E7EB",
          container: {
            DEFAULT: "#F0EDED",
            lowest: "#FFFFFF",
            low: "#F6F3F2",
            high: "#EAE7E7",
            highest: "#E5E2E1",
          },
        },
        "on-surface": "#1C1B1B",
        "on-surface-variant": "#5C3F3F",
        "inverse-surface": "#313030",
        "inverse-on-surface": "#F3F0EF",
        outline: {
          DEFAULT: "#916F6E",
          variant: "#E5BDBC",
        },
        "error-container": "#FFDAD6",
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

