"use client";

import React, { useState } from "react";
import { SubscriptionPlans } from "@/components/features/Monetization/subscriptions/SubscriptionPlans";
import { SubscribeDialog } from "@/components/features/Monetization/subscriptions/SubscribeDialog";
import { SubscriptionStatus } from "@/components/features/Monetization/subscriptions/SubscriptionStatus";
import { AllYouCanReadPlan } from "@/components/features/Monetization/subscriptions/AllYouCanReadPlan";
import { VIPLevels } from "@/components/features/Monetization/subscriptions/VIPLevels";

const DEFAULT_ALL_YOU_CAN_READ_BENEFITS = [
  "Unlimited paid chapters",
  "Auto-sync across devices",
  "Monthly bonus points",
];

const DEFAULT_VIP_LEVELS = [
  { id: "vip-1", name: "VIP 1", requiredSpend: 50, benefits: ["+5 bonus votes", "+1 privilege chapter"] },
  { id: "vip-3", name: "VIP 3", requiredSpend: 200, benefits: ["+15 bonus votes", "+3 privilege chapters"] },
  { id: "vip-5", name: "VIP 5", requiredSpend: 500, benefits: ["+50 bonus votes", "+10 privilege chapters", "Exclusive badge"] },
];

export default function SubscriptionsPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(
    null
  );

  const handleSelectPlan = (planId: string, planName?: string, price?: number) => {
    setSelectedPlanId(planId);
    setSelectedPlan({ id: planId, name: planName ?? planId, price: price ?? 0 });
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <p className="text-xs uppercase text-muted-foreground">Monetization</p>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Choose a plan to unlock more benefits and support authors.
        </p>
      </div>

      <SubscriptionStatus />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Plans</h2>
        <SubscriptionPlans
          onSelectPlan={(planId) => handleSelectPlan(planId, `Plan ${planId}`, 9.99)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">All-You-Can-Read</h2>
        <AllYouCanReadPlan
          price={14.99}
          benefits={DEFAULT_ALL_YOU_CAN_READ_BENEFITS}
          onSelect={() => handleSelectPlan("all-you-can-read", "All You Can Read", 14.99)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">VIP Levels</h2>
        <VIPLevels levels={DEFAULT_VIP_LEVELS} />
      </section>

      <SubscribeDialog
        open={!!selectedPlanId}
        onClose={() => setSelectedPlanId(null)}
        planId={selectedPlanId}
        planName={selectedPlan?.name}
        price={selectedPlan?.price}
      />
    </div>
  );
}

