"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get("email"),
      username: form.get("username"),
      password: form.get("password")
    };

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body?.error?.message ?? "Unable to register");
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100">Create account</h1>
      <p className="mt-2 text-sm text-slate-400">Join the library and sync your stories across devices.</p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-300">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-300">Username</span>
          <input
            name="username"
            minLength={3}
            required
            className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-300">Password</span>
          <input
            name="password"
            type="password"
            minLength={6}
            required
            className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100"
          />
        </label>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
