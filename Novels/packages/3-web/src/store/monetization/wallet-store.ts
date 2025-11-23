import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WalletUIState {
  isTopUpDialogOpen: boolean;
  defaultPaymentMethod: string | null;
  lastTopUpAmount?: number;
  selectedTransactionFilter: "all" | "top-up" | "purchase";
  openTopUpDialog: () => void;
  closeTopUpDialog: () => void;
  setDefaultPaymentMethod: (method: string) => void;
  setLastTopUpAmount: (amount: number) => void;
  setTransactionFilter: (filter: WalletUIState["selectedTransactionFilter"]) => void;
}

export const useWalletStore = create<WalletUIState>()(
  persist(
    (set) => ({
      isTopUpDialogOpen: false,
      defaultPaymentMethod: null,
      selectedTransactionFilter: "all",
      openTopUpDialog: () => set({ isTopUpDialogOpen: true }),
      closeTopUpDialog: () => set({ isTopUpDialogOpen: false }),
      setDefaultPaymentMethod: (method) => set({ defaultPaymentMethod: method }),
      setLastTopUpAmount: (amount) => set({ lastTopUpAmount: amount }),
      setTransactionFilter: (filter) => set({ selectedTransactionFilter: filter }),
    }),
    {
      name: "wallet-ui-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);



