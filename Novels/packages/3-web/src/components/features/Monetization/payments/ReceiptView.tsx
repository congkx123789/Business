"use client";

import React from "react";

interface ReceiptViewProps {
  receipt: {
    id: string;
    chapterTitle: string;
    amount: number;
    purchasedAt: string;
    paymentMethod: string;
  };
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt }) => {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Receipt ID</span>
        <span className="font-medium">{receipt.id}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Chapter</span>
        <span className="font-medium">{receipt.chapterTitle}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Amount</span>
        <span className="font-medium text-primary">{receipt.amount} pts</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Payment Method</span>
        <span className="font-medium capitalize">{receipt.paymentMethod}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Purchased</span>
        <span className="font-medium">{new Date(receipt.purchasedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

