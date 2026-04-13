// Mirrors the --foreground / --muted-foreground tokens in src/global.css.
// RN icon `color` props take a raw value, not a className, so this keeps
// them in sync with the light/dark palette defined there.
export const themeColors = {
  light: {
    foreground: "#171717",
    mutedForeground: "#737373",
    background: "#ffffff",
    border: "#e5e5e5",
  },
  dark: {
    foreground: "#fafafa",
    mutedForeground: "#a1a1a1",
    background: "#0a0a0a",
    border: "#2e2e2e",
  },
};
