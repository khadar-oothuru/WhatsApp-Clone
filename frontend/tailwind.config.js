/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // WhatsApp Web authentic colors - Dark theme (existing)
        "wa-bg": "#161717",
        "wa-panel": "#202c33",
        "wa-panel-header": "#2a3942",
        "wa-border": "#3b4a54",
        "wa-text": "#e9edef",
        "wa-text-secondary": "#8696a0",
        "wa-text-tertiary": "#667781",
        "wa-primary": "#00a884",
        "wa-primary-dark": "#008069",
        "wa-primary-strong": "#00d9ff",
        "wa-secondary": "#53bdeb",
        "wa-online": "#4ade80",
        "wa-bubble-out": "#005c4b",
        "wa-bubble-in": "#202c33",
        "wa-input": "#2a3942",
        "wa-hover": "#182229",
        "wa-active": "#2a3942",

        // WhatsApp Web authentic colors - Light theme
        "wa-light-bg": "#f0f2f5",
        "wa-light-panel": "#ffffff",
        "wa-light-panel-header": "#ffffff",
        "wa-light-border": "#e9edef",
        "wa-light-text": "#111b21",
        "wa-light-text-secondary": "#667781",
        "wa-light-green": "#25d366",
        "wa-light-green-dark": "#128c7e",
        "wa-light-bubble-out": "#d9fdd3",
        "wa-light-bubble-in": "#ffffff",
        "wa-light-input": "#ffffff",
        "wa-light-hover": "#f5f6f6",
        "wa-light-active": "#e9edef",
        "wa-green": {
          50: "#e6fffa",
          100: "#b3f5e8",
          500: "#00a884",
          600: "#008069",
          700: "#005c4b",
        },
        "wa-gray": {
          50: "#f7fafc",
          100: "#edf2f7",
          200: "#e2e8f0",
          300: "#cbd5e0",
          400: "#a0aec0",
          500: "#718096",
          600: "#4a5568",
          700: "#2d3748",
          800: "#1a202c",
          900: "#171923",
        },
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "Helvetica Neue",
          "Helvetica",
          "Lucida Grande",
          "Arial",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      spacing: {
        18: "4.5rem",
        68: "17rem",
        76: "19rem",
        84: "21rem",
        88: "22rem",
        92: "23rem",
        96: "24rem",
        100: "25rem",
        104: "26rem",
        108: "27rem",
        112: "28rem",
      },
      maxWidth: {
        "2xs": "16rem",
        "8xl": "88rem",
        "9xl": "96rem",
      },
      boxShadow: {
        wa: "0 2px 5px 0 rgba(11, 20, 26, 0.26), 0 2px 10px 0 rgba(11, 20, 26, 0.16)",
        "wa-lg":
          "0 6px 10px 0 rgba(11, 20, 26, 0.15), 0 1px 18px 0 rgba(11, 20, 26, 0.12)",
        message: "0 1px 0.5px rgba(11, 20, 26, 0.13)",
      },
      backgroundImage: {
        "wa-pattern":
          "url('data:image/svg+xml,%3Csvg width=%27100%27 height=%27100%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cdefs%3E%3Cpattern id=%27a%27 patternUnits=%27userSpaceOnUse%27 width=%27100%27 height=%27100%27 patternTransform=%27scale(0.5) rotate(0)%27%3E%3Crect x=%270%27 y=%270%27 width=%27100%25%27 height=%27100%25%27 fill=%27%230b141a%27/%3E%3Cpath d=%27M0 0h100v100H0z%27 fill=%27%230b141a%27/%3E%3Cg fill=%27%23182229%27 opacity=%27.04%27%3E%3Cpath d=%27m50 34.2 25 14.4v28.8L50 91.8 25 77.4V48.6z%27/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27url(%23a)%27/%3E%3C/svg%3E')",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out",
        "slide-in": "slideIn 300ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [
    // Add custom scrollbar utilities
    function ({ addUtilities, variants }) {
      const scrollbarUtilities = {
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
        },
        ".scrollbar-thumb-wa-text-secondary": {
          "&::-webkit-scrollbar-thumb": {
            "background-color": "rgba(134, 150, 160, 0.3)",
            "border-radius": "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            "background-color": "rgba(134, 150, 160, 0.5)",
          },
        },
        ".scrollbar-thumb-wa-text-tertiary": {
          "&::-webkit-scrollbar-thumb": {
            "background-color": "rgba(102, 119, 129, 0.3)",
            "border-radius": "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            "background-color": "rgba(102, 119, 129, 0.5)",
          },
        },
        ".scrollbar-track-transparent": {
          "&::-webkit-scrollbar-track": {
            "background-color": "transparent",
          },
        },
      };
      addUtilities(scrollbarUtilities, variants("scrollbar"));
    },
  ],
  darkMode: "class",
};
