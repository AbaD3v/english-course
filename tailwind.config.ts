import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)",
        card: "0 12px 32px rgba(0,0,0,0.08)",
      },
      colors: {
        bg: "hsl(var(--bg))",
        card: "hsl(var(--card))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        accentFg: "hsl(var(--accent-fg))",
        danger: "hsl(var(--danger))",
        success: "hsl(var(--success))",
      },
    },
  },
  plugins: [],
} satisfies Config;