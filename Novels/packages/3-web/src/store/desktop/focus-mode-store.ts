// Focus mode state store (text width limiter)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FocusModeState {
  isFocusMode: boolean;
  maxWidth: number; // in ch units (characters)
  alignment: "center" | "left";
  toggleFocusMode: () => void;
  setMaxWidth: (width: number) => void;
  setAlignment: (alignment: FocusModeState["alignment"]) => void;
}

export const useFocusModeStore = create<FocusModeState>()(
  persist(
    (set) => ({
      isFocusMode: true, // Default enabled
      maxWidth: 65, // Default 65ch (~800px)
      alignment: "center",
      toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
      setMaxWidth: (width) => set({ maxWidth: Math.max(50, Math.min(90, width)) }),
      setAlignment: (alignment) => set({ alignment }),
    }),
    {
      name: "focus-mode-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

