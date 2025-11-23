export const BACKGROUND_PRESETS = [
  {
    id: "day",
    label: "Day",
    backgroundColor: "#fdf7ec",
    textColor: "#1f2937",
  },
  {
    id: "night",
    label: "Night",
    backgroundColor: "#0f172a",
    textColor: "#e2e8f0",
  },
  {
    id: "sepia",
    label: "Sepia",
    backgroundColor: "#f5ecd9",
    textColor: "#42210b",
  },
  {
    id: "eye-protection",
    label: "Eye Care",
    backgroundColor: "#e2f5da",
    textColor: "#1f2937",
  },
] as const;

export type BackgroundPresetId = (typeof BACKGROUND_PRESETS)[number]["id"];

export const FONT_FAMILIES = [
  { id: "var(--font-sans)", label: "Sans Serif" },
  { id: "'Georgia', serif", label: "Serif" },
  { id: "'Merriweather', serif", label: "Merriweather" },
  { id: "'Noto Serif SC', serif", label: "Songti" },
  { id: "'Fira Code', monospace", label: "Monospace" },
] as const;


