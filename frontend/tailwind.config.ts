import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "void": "#0A0A0F",
        "surface": "#12121A",
        "elevated": "#1C1C28",
        "primary": "#7C5CFC",
        "primary-light": "#947DFF",
        "secondary": "#00E5FF",
        "error": "#FF4D6D",
        "success": "#00D68F",
        "text-primary": "#F0F0FF",
        "text-secondary": "#8888AA",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
