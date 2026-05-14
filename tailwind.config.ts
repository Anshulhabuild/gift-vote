import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fbf8f2",
          100: "#f6f0e3",
          200: "#ede2c8",
        },
        ink: {
          900: "#1c1a16",
          800: "#2a2620",
          700: "#3d3830",
          500: "#6b6358",
        },
        sage: {
          400: "#8aa490",
          500: "#6c8d75",
          600: "#52735c",
          700: "#3f5848",
        },
        terra: {
          400: "#d28b6b",
          500: "#b96c4a",
          600: "#9c5638",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-bricolage)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
