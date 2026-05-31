import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        champagne: "#F7E8D7",
        nude: "#E8C6BE",
        rose: "#C9828B",
        cocoa: "#432D2D",
        gold: "#C89B52",
        cream: "#FFF9F3"
      }
    }
  },
  plugins: []
};

export default config;
