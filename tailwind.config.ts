import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        euphoria: {
          bg: "#0C0C0C",
          panel: "#121212",
          panel2: "#181818",
          border: "#262626",
          pink: "#FFBAE0",
          magenta: "#FC8DF4",
          purple: "#FF3A37",
          cyan: "#FFFFFF",
          text: "#FFFFFF",
          muted: "#B2ACB8",
          subtle: "#7F7A85",
          green: "#8fd6a3",
          red: "#FF3A37"
        }
      },
      boxShadow: {
        glow: "0 8px 32px rgba(255, 186, 224, 0.15)",
        panel: "0 8px 24px rgba(0, 0, 0, 0.4)"
      }
    }
  },
  plugins: []
};

export default config;
