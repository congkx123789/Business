import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_LAYOUT_PRESET,
  LAYOUT_PRESETS,
  LayoutPreset,
} from "@/lib/desktop/layout/layout-presets";
import { resizePanels, normalizePanelSizes } from "@/lib/desktop/layout/panel-resizer";
import type { LayoutPanel } from "@/lib/desktop/layout/layout-presets";
import { applyFocusModePreset } from "@/lib/desktop/layout/focus-mode-manager";

interface LayoutState {
  activePresetId: LayoutPreset["id"];
  panels: LayoutPanel[];
  updatedAt: string;
  setPreset: (presetId: LayoutPreset["id"]) => void;
  resizePanel: (panelId: string, delta: number) => void;
  setPanels: (panels: LayoutPanel[]) => void;
  resetLayout: () => void;
}

const createPanelState = (preset: LayoutPreset): LayoutPanel[] =>
  preset.panels.map((panel) => ({ ...panel }));

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      activePresetId: DEFAULT_LAYOUT_PRESET.id,
      panels: createPanelState(DEFAULT_LAYOUT_PRESET),
      updatedAt: new Date().toISOString(),
      setPreset: (presetId) => {
        const preset = LAYOUT_PRESETS.find((entry) => entry.id === presetId) ?? DEFAULT_LAYOUT_PRESET;
        applyFocusModePreset(preset.focusMode ?? {});
        set({
          activePresetId: preset.id,
          panels: createPanelState(preset),
          updatedAt: new Date().toISOString(),
        });
      },
      resizePanel: (panelId, delta) =>
        set((state) => ({
          panels: normalizePanelSizes(resizePanels(state.panels, panelId, delta)),
          updatedAt: new Date().toISOString(),
        })),
      setPanels: (panels) =>
        set({
          panels,
          updatedAt: new Date().toISOString(),
        }),
      resetLayout: () =>
        set({
          activePresetId: DEFAULT_LAYOUT_PRESET.id,
          panels: createPanelState(DEFAULT_LAYOUT_PRESET),
          updatedAt: new Date().toISOString(),
        }),
    }),
    {
      name: "layout-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);


