import type { Config } from "tailwindcss";
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          blue: '#3B82F6',
          coral: '#FF7F50',
          lightBlue: '#EBF8FF',
        },
        light: {
          background: '#FFFFFF',
          card: '#F3F4F6',
          text: '#1F2937',
        },
        dark: {
          background: '#111827',
          card: '#1F2937',
          text: '#F9FAFB',
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "collapsible-up": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "orbit": {
          "0%": {
            transform: "rotate(0deg) translateX(50px) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateX(50px) rotate(-360deg)",
          },
        },
        "glow": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.5",
            transform: "scale(1.5)",
          },
        },
        "rotate": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "gradient-x": "gradient-x 15s ease infinite",
        "float-slow": "float 20s ease-in-out infinite",
        "float-medium": "float 15s ease-in-out infinite",
        "float-fast": "float 10s ease-in-out infinite",
        "orbit-slow": "orbit 20s linear infinite",
        "orbit-medium": "orbit 15s linear infinite",
        "orbit-fast": "orbit 10s linear infinite",
        "glow-slow": "glow 4s ease-in-out infinite",
        "glow-medium": "glow 3s ease-in-out infinite",
        "glow-fast": "glow 2s ease-in-out infinite",
        "rotate-slow": "rotate 10s linear infinite",
        "rotate-medium": "rotate 7s linear infinite",
        "rotate-fast": "rotate 4s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
} satisfies Config;

export default config;
