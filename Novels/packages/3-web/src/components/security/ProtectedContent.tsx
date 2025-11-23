"use client";

import React from "react";
import { CopyProtection } from "./CopyProtection";
import { cn } from "@/lib/utils";

interface ProtectedContentProps {
  isProtected: boolean;
  watermark?: string;
  className?: string;
  children: React.ReactNode;
  onViolation?: (type: "copy" | "context-menu" | "screenshot") => void;
}

/**
 * ProtectedContent wraps paid chapters or sensitive text.
 * It disables selection and copy events while optionally rendering a watermark.
 */
export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  isProtected,
  watermark,
  className,
  children,
  onViolation,
}) => {
  if (!isProtected) {
    return <div className={className}>{children}</div>;
  }

  return (
    <CopyProtection onBlockedAction={onViolation}>
      <div
        className={cn("relative select-none pointer-events-auto", className)}
        data-watermark-layer={watermark ? "true" : undefined}
      >
        {watermark && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 select-none opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 40px)`,
            }}
          >
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8 text-4xl font-black uppercase tracking-widest text-white/50">
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} className="rotate-12">
                  {watermark}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    </CopyProtection>
  );
};


