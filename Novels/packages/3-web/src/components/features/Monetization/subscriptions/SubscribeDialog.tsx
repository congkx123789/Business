"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSubscribe } from "@/lib/hooks/monetization/useSubscription";

interface SubscribeDialogProps {
  open: boolean;
  onClose: () => void;
  planId: string | null;
  planName?: string;
  price?: number;
}

export const SubscribeDialog: React.FC<SubscribeDialogProps> = ({
  open,
  onClose,
  planId,
  planName,
  price,
}) => {
  const subscribe = useSubscribe();

  const handleSubscribe = async () => {
    if (!planId) return;
    await subscribe.mutateAsync(planId);
    onClose();
  };

  if (!open || !planId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Confirm Subscription</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>Plan: <span className="font-medium text-foreground">{planName}</span></p>
          {price && <p>Price: <span className="font-medium text-foreground">${price}/month</span></p>}
          <p>You can cancel anytime in Subscription settings.</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} disabled={subscribe.isPending}>
            {subscribe.isPending ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </div>
    </div>
  );
};

