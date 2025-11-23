"use client";

import React from "react";

interface AllYouCanReadPlanProps {
  price: number;
  benefits: string[];
  onSelect: () => void;
}

export const AllYouCanReadPlan: React.FC<AllYouCanReadPlanProps> = ({
  price,
  benefits,
  onSelect,
}) => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="text-xs uppercase text-muted-foreground">All You Can Read</p>
      <h3 className="text-2xl font-semibold text-foreground">${price}/month</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2">
            <span>•</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onSelect}
        className="mt-4 w-full rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Subscribe
      </button>
    </div>
  );
};

