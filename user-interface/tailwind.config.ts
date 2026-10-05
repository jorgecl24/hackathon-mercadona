import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          foreground: "var(--primary-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          soft: "var(--destructive-soft)",
        },
        "success-soft": "var(--success-soft)",
        heatmap: {
          low: "var(--heatmap-low)",
          mid: "var(--heatmap-mid)",
          high: "var(--heatmap-high)",
          crit: "var(--heatmap-crit)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.03)",
      },
    },
  },
  plugins: [],
} satisfies Config;
