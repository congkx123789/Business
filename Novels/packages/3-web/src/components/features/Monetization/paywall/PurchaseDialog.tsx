"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from "../payments/PaymentMethodSelector";
import { PaymentConfirmation } from "../payments/PaymentConfirmation";

interface PurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle: string;
  price: number;
  onConfirm: (method: string) => Promise<void> | void;
}

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  open,
  onClose,
  chapterTitle,
  price,
  onConfirm,
}) => {
  const [method, setMethod] = useState("wallet");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm(method);
    setIsProcessing(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Purchase Chapter</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Chapter</p>
            <p className="text-base font-semibold">{chapterTitle}</p>
          </div>
          <PaymentMethodSelector value={method} onChange={setMethod} />
          <PaymentConfirmation
            amount={price}
            chapterTitle={chapterTitle}
            onConfirm={handleConfirm}
            onCancel={onClose}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

