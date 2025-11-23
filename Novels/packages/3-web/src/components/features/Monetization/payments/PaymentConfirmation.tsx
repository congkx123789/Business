"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PaymentConfirmationProps {
  amount: number;
  currency?: string;
  paymentMethod?: string;
  chapterTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  isLoading?: boolean;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  currency = "USD",
  paymentMethod,
  chapterTitle,
  onConfirm,
  onCancel,
  isProcessing,
  isLoading,
}) => {
  const processing = isProcessing || isLoading;
  const displayAmount = currency === "USD" ? `$${(amount * 0.01).toFixed(2)}` : `${amount} pts`;

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {chapterTitle ? "Confirm Purchase" : "Confirm Top Up"}
        </p>
        <p className="text-lg font-semibold text-foreground">
          {chapterTitle ? `Unlock "${chapterTitle}"` : "Top Up Wallet"}
        </p>
      </div>
      <div className="space-y-2 rounded-lg border border-border/50 bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-xl font-bold text-primary">{displayAmount}</p>
        </div>
        {paymentMethod && (
          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="text-sm font-medium capitalize">{paymentMethod.replace("-", " ")}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={processing}>
          {processing ? "Processing..." : "Confirm"}
        </Button>
      </div>
    </div>
  );
};

