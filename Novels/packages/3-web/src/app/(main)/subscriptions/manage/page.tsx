"use client";

import React from "react";
import { SubscriptionStatus } from "@/components/features/Monetization/subscriptions/SubscriptionStatus";

export default function ManageSubscriptionPage() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <p className="text-xs uppercase text-muted-foreground">Subscriptions</p>
        <h1 className="text-3xl font-bold">Manage Subscription</h1>
        <p className="text-sm text-muted-foreground">
          View your current plan and cancel or upgrade anytime.
        </p>
      </div>
      <SubscriptionStatus />
    </div>
  );
}

