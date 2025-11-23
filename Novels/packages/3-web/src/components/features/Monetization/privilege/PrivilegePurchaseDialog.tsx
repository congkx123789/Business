"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { usePurchasePrivilege } from "@/lib/hooks/monetization/usePrivilege";

interface PrivilegePurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  storyId: string;
  price: number;
}

export const PrivilegePurchaseDialog: React.FC<PrivilegePurchaseDialogProps> = ({
  open,
  onClose,
  storyId,
  price,
}) => {
  const purchasePrivilege = usePurchasePrivilege();

  const handlePurchase = async () => {
    await purchasePrivilege.mutateAsync(storyId);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Purchase Privilege</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>Get early access to advanced chapters for this story.</p>
          <p className="text-base font-semibold text-primary">Cost: {price} points</p>
          <p>A new fee is required every month (resets on the 1st).</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={purchasePrivilege.isPending}>
            {purchasePrivilege.isPending ? "Processing..." : "Purchase"}
          </Button>
        </div>
      </div>
    </div>
  );
};

