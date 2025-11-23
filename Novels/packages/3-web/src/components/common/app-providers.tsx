"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../store/server-state";
import { AuthProvider } from "../../lib/context/auth-context";
import { ShortcutProvider } from "../desktop/shortcuts/ShortcutProvider";
import { GlobalShortcuts } from "../shared/GlobalShortcuts";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShortcutProvider>
          <GlobalShortcuts />
          {children}
        </ShortcutProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
