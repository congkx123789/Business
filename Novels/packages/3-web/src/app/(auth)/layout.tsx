import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/40 border border-slate-800 p-8">
        {children}
      </div>
    </div>
  );
}
