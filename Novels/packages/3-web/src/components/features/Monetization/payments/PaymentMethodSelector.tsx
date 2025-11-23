"use client";

import React from "react";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "wallet", label: "Wallet Balance" },
  { id: "credit-card", label: "Credit Card" },
  { id: "paypal", label: "PayPal" },
];

interface PaymentMethodSelectorProps {
  value?: string | null;
  selectedMethod?: string | null;
  onSelectMethod?: (method: string) => void;
  onChange?: (value: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  selectedMethod,
  onSelectMethod,
  onChange,
}) => {
  const currentValue = selectedMethod || value || "";
  const handleChange = onSelectMethod || onChange || (() => {});
  return (
    <div className="space-y-2">
      {METHODS.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => handleChange(method.id)}
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-left text-sm transition",
            currentValue === method.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {method.label}
        </button>
      ))}
    </div>
  );
};

