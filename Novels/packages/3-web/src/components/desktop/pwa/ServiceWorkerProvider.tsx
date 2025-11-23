"use client";

import React, { useEffect } from "react";

export const ServiceWorkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/pwa/service-worker.js")
          .catch((error) => console.error("Service Worker registration failed:", error));
      });
    }
  }, []);

  return <>{children}</>;
};

