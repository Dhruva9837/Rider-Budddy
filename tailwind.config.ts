import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D0D15",
        accent: "#8B5CF6",
        surface: "#151525",
        surfaceElevated: "#1C1C35",

        textPrimary: "#FFFFFF",
        textSecondary: "#94A3B8",
        divider: "#2D2D50",

        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#6366F1"
      },

      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        full: "999px"
      },

      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.25)",
        lg: "0 8px 32px rgba(0,0,0,0.45)"
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [],
};
export default config;
