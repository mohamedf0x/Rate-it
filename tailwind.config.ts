import type { Config } from "tailwindcss";

/** Tokens live in src/app/globals.css as RGB channels; this maps them onto Tailwind
 *  so utilities and alpha modifiers (bg-brand/10) both work. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        border: token("border"),
        "border-strong": token("border-strong"),
        ink: token("ink"),
        muted: token("muted"),
        brand: token("brand"),
        "brand-soft": token("brand-soft"),
        "on-brand": token("on-brand"),
        gold: token("gold"),
        "gold-soft": token("gold-soft"),
        lapis: token("lapis"),
        "lapis-soft": token("lapis-soft"),
        pomegranate: token("pomegranate"),
        "pomegranate-soft": token("pomegranate-soft"),
        pistachio: token("pistachio"),
        "pistachio-soft": token("pistachio-soft"),
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgb(14 26 27 / 0.05), 0 8px 24px -14px rgb(14 26 27 / 0.2)",
        lift: "0 2px 4px rgb(14 26 27 / 0.07), 0 16px 32px -18px rgb(14 26 27 / 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
