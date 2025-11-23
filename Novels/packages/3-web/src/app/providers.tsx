"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../store/server-state";
import { AuthProvider } from "../lib/context/auth-context";
import { ShortcutProvider } from "../components/desktop/shortcuts/ShortcutProvider";
import { GlobalShortcuts } from "../components/shared/GlobalShortcuts";

export function Providers({ children }: { children: ReactNode }) {
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

