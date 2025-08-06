const tintColorLight = "#1BA6A5"; // Calm teal for primary actions
const tintColorDark = "#4FE3E1";  // Soft aqua glow for dark mode
const primary = "#00BFA6";        // Primary brand color - medical teal
const secondary = "#005F73";      // Deep teal for accents / headers

export const Colors = {
  light: {
    text: "#0A2E36",             // Dark teal for text
    background: "#F4F9F9",       // Soft bluish-white background
    tint: tintColorLight,        // For buttons & highlights
    icon: "#4B778D",             // Muted blue for icons
    tabIconDefault: "#A1B5C1",   // Light gray-blue for inactive tabs
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#E3FDFD",             // Light cyan text for dark mode
    background: "#021F2B",       // Deep medical navy background
    tint: tintColorDark,
    icon: "#7FDBDA",             // Muted cyan for icons
    tabIconDefault: "#44626A",
    tabIconSelected: tintColorDark,
  },
  PRIMARY: primary,
  SECONDARY: secondary,
};
