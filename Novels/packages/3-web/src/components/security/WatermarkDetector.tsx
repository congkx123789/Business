"use client";

import React from "react";

export interface WatermarkDetectorProps {
  targetSelector?: string;
  pollInterval?: number;
  onTamper?: (message: string) => void;
  onStatusChange?: (status: "watching" | "missing") => void;
}

const DEFAULT_SELECTOR = "[data-watermark-layer]";

export const WatermarkDetector: React.FC<WatermarkDetectorProps> = ({
  targetSelector = DEFAULT_SELECTOR,
  pollInterval = 3000,
  onTamper,
  onStatusChange,
}) => {
  const timerRef = React.useRef<ReturnType<typeof setInterval>>();
  const mutationRef = React.useRef<MutationObserver>();
  const lastStatus = React.useRef<"watching" | "missing">("watching");

  const reportStatus = (status: "watching" | "missing") => {
    if (lastStatus.current !== status) {
      lastStatus.current = status;
      onStatusChange?.(status);
    }
  };

  React.useEffect(() => {
    const checkPresence = () => {
      const target = document.querySelector(targetSelector);
      if (!target) {
        reportStatus("missing");
        onTamper?.(`Watermark element (${targetSelector}) is missing`);
        return;
      }
      reportStatus("watching");
    };

    const startMutationObserver = () => {
      const root = document.documentElement;
      if (!root) return;
      mutationRef.current = new MutationObserver(checkPresence);
      mutationRef.current.observe(root, {
        childList: true,
        attributes: true,
        subtree: true,
      });
    };

    checkPresence();
    startMutationObserver();
    timerRef.current = setInterval(checkPresence, pollInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      mutationRef.current?.disconnect();
    };
  }, [pollInterval, targetSelector, onTamper]);

  return null;
};


