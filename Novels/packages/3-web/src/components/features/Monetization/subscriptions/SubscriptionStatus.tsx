"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStatus, useCancelSubscription } from "@/lib/hooks/monetization/useSubscription";

export const SubscriptionStatus: React.FC = () => {
  const { data: status, isLoading } = useSubscriptionStatus();
  const cancelSubscription = useCancelSubscription();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        Checking subscription status...
      </div>
    );
  }

  if (!status?.active) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        No active subscription.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-emerald-300">Active Subscription</p>
          <p className="text-lg font-semibold text-emerald-100">{status.planName}</p>
          <p className="text-sm text-emerald-200">
            Renews {status.renewsAt ? new Date(status.renewsAt).toLocaleDateString() : "monthly"}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-emerald-300 text-emerald-100 hover:bg-emerald-500/20"
          onClick={() => cancelSubscription.mutateAsync()}
          disabled={cancelSubscription.isPending}
        >
          {cancelSubscription.isPending ? "Cancelling..." : "Cancel"}
        </Button>
      </div>
    </div>
  );
};

