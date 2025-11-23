// Subscription store (client state)
// Stores UI state for subscription management (dialog state, selected plan, etc.)
// Note: Actual subscription data is stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SubscriptionUIState {
  isSubscribeDialogOpen: boolean;
  selectedPlanId: string | null;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  managementModalOpen: boolean;
  status: "inactive" | "active" | "grace-period";
  renewalDate?: string;
  showSubscribeDialog: (planId?: string) => void;
  hideSubscribeDialog: () => void;
  setBillingCycle: (cycle: SubscriptionUIState["billingCycle"]) => void;
  setSelectedPlanId: (planId: string | null) => void;
  selectPlan: (planId: string) => void;
  toggleAutoRenew: () => void;
  openManagementModal: () => void;
  closeManagementModal: () => void;
  setStatus: (status: SubscriptionUIState["status"], renewalDate?: string) => void;
}

export const useSubscriptionStore = create<SubscriptionUIState>()(
  persist(
    (set) => ({
      isSubscribeDialogOpen: false,
      selectedPlanId: null,
      billingCycle: "monthly",
      autoRenew: true,
      managementModalOpen: false,
      status: "inactive",
      renewalDate: undefined,
      showSubscribeDialog: (planId) =>
        set({
          isSubscribeDialogOpen: true,
          selectedPlanId: planId ?? null,
        }),
      hideSubscribeDialog: () =>
        set({
          isSubscribeDialogOpen: false,
          selectedPlanId: null,
        }),
      setBillingCycle: (cycle) => set({ billingCycle: cycle }),
      setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),
      selectPlan: (planId) => set({ selectedPlanId: planId }),
      toggleAutoRenew: () => set((state) => ({ autoRenew: !state.autoRenew })),
      openManagementModal: () => set({ managementModalOpen: true }),
      closeManagementModal: () => set({ managementModalOpen: false }),
      setStatus: (status, renewalDate) => set({ status, renewalDate }),
    }),
    {
      name: "subscription-ui-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
