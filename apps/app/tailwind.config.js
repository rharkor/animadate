import * as path from "path"

import { nextui } from "@nextui-org/react"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ...["pages/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"].map((p) =>
      path.join(__dirname, p)
    ),
    path.join(__dirname, "../..", "node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        muted: "hsl(var(--nextui-default-100))",
        "muted-foreground": "hsl(var(--nextui-default-600))",
      },
      keyframes: {
        ripple: {
          "0%": {
            transform: "scale(0)",
            opacity: 0.75,
          },
          "100%": {
            transform: "scale(3)",
            opacity: 0,
          },
        },
      },
      animation: {
        ripple: "ripple 0.5s",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#6AD2E7",
              900: "#D8E3E6",
            },
            focus: "#6AD2E7",
            background: "#E2EFF1",
          },
        },
        dark: {
          colors: {},
        },
      },
    }),
  ],
}
