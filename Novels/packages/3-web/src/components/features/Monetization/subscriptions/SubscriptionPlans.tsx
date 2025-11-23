"use client";

import React from "react";
import { useSubscriptionPlans } from "@/lib/hooks/monetization/useSubscription";
import { Button } from "@/components/ui/button";

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const { data: plans, isLoading } = useSubscriptionPlans();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Loading plans...
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No subscription plans available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan: any) => (
        <div key={plan.id} className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <div className="space-y-2">
            <p className="text-xs uppercase text-muted-foreground">{plan.tier}</p>
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-3xl font-bold text-primary">${plan.price}/mo</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {plan.benefits?.map((benefit: string) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span>•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={() => onSelectPlan(plan.id)}>
              Choose Plan
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

