"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTopUpWallet } from "@/lib/hooks/monetization/useWallet";
import { PaymentMethodSelector } from "@/components/features/Monetization/payments/PaymentMethodSelector";
import { PaymentConfirmation } from "@/components/features/Monetization/payments/PaymentConfirmation";
import { X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopUpDialogProps {
  open: boolean;
  onClose: () => void;
}

// Preset amounts in points (1 point = 0.01 USD)
const PRESET_AMOUNTS = [
  { points: 100, usd: 1.0, label: "$1.00" },
  { points: 500, usd: 5.0, label: "$5.00" },
  { points: 1000, usd: 10.0, label: "$10.00" },
  { points: 2000, usd: 20.0, label: "$20.00" },
  { points: 5000, usd: 50.0, label: "$50.00" },
  { points: 10000, usd: 100.0, label: "$100.00" },
];

type Step = "amount" | "payment" | "confirmation" | "success";

export const TopUpDialog: React.FC<TopUpDialogProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const topUp = useTopUpWallet();

  const handlePresetAmount = (points: number) => {
    setAmount(points);
    setCustomAmount("");
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleNext = () => {
    if (step === "amount") {
      setStep("payment");
    } else if (step === "payment" && paymentMethod) {
      setStep("confirmation");
    }
  };

  const handleConfirm = async () => {
    if (!paymentMethod) return;
    try {
      await topUp.mutateAsync({ amount, paymentMethod });
      setStep("success");
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset state
        setStep("amount");
        setAmount(1000);
        setCustomAmount("");
        setPaymentMethod(null);
      }, 2000);
    } catch (error) {
      console.error("Top-up failed:", error);
      // Stay on confirmation step to retry
    }
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("amount");
    } else if (step === "confirmation") {
      setStep("payment");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setStep("amount");
    setAmount(1000);
    setCustomAmount("");
    setPaymentMethod(null);
  };

  if (!open) return null;

  const usdAmount = (amount * 0.01).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Top Up Wallet</h3>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step 1: Amount Selection */}
        {step === "amount" && (
          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-sm font-medium">Select Amount</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.points}
                    type="button"
                    onClick={() => handlePresetAmount(preset.points)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                      amount === preset.points
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-xs text-muted-foreground">{preset.points} pts</div>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  placeholder="Custom amount (points)"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  className="pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">points</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {amount} points = ${usdAmount} USD
              </p>
            </div>
            <Button onClick={handleNext} className="w-full" disabled={amount < 1}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === "payment" && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Selected Amount</h4>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{amount.toLocaleString()} points</p>
                <p className="text-sm text-muted-foreground">${usdAmount} USD</p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Payment Method</label>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" disabled={!paymentMethod}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirmation" && (
          <div className="space-y-4">
            <PaymentConfirmation
              amount={amount}
              currency="USD"
              paymentMethod={paymentMethod || undefined}
              onConfirm={handleConfirm}
              onCancel={handleBack}
              isLoading={topUp.isPending}
            />
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            <div>
              <h4 className="text-lg font-semibold">Top-up Successful!</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {amount.toLocaleString()} points have been added to your wallet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

