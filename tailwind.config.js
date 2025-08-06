/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ✅ Consolidated Color Palette
      colors: {
        // Brand Colors
        primary: "#00BFA6",        // Medical teal - primary brand
        secondary: "#005F73",      // Deep teal - accent/headers

        // Accent / Action Colors
        tintLight: "#1BA6A5",      // Hover/active teal
        tintDark: "#4FE3E1",       // Aqua glow (dark mode highlight)

        // Background Colors
        bgLight: "#F4F9F9",        // Light mode background
        bgDark: "#021F2B",         // Dark mode background

        // Text Colors
        textLight: "#0A2E36",      // Text in light mode
        textDark: "#E3FDFD",       // Text in dark mode

        // Icon & Tab Colors
        iconLight: "#4B778D",      // Icons in light mode
        iconDark: "#7FDBDA",       // Icons in dark mode
        tabDefault: "#A1B5C1",     // Inactive tab
        tabDark: "#44626A",        // Inactive tab (dark mode)
      },

      // ✅ Gradient Utilities
      backgroundImage: {
        "gradient-medical": "linear-gradient(180deg, #00BFA6 0%, #005F73 100%)",
        "gradient-medical-horizontal": "linear-gradient(90deg, #00BFA6 0%, #005F73 100%)",
        "gradient-soft": "linear-gradient(180deg, #F4F9F9 0%, #EAF4F4 100%)",
      },

      // ✅ Rounded Corners
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },

      // ✅ Shadows for Cards, Buttons, and Modals
      boxShadow: {
        card: "0 4px 12px rgba(0, 95, 115, 0.15)",    // Soft medical card shadow
        button: "0 4px 10px rgba(0, 191, 166, 0.3)",  // Teal button glow
        modal: "0 6px 20px rgba(0, 95, 115, 0.25)",   // Modal/elevated elements
      },

      // ✅ Optional Transition & Opacity Utilities for Smooth Animations
      transitionProperty: {
        width: "width",
        spacing: "margin, padding",
      },
      opacity: {
        15: "0.15",
      },
    },
  },
  plugins: [],
};
