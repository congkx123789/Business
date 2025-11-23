"use client";

import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Sign in to manage your profile.");
      return;
    }

    fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load profile");
        }
        return response.json();
      })
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Unexpected error"));
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Sign in again to continue.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      username: form.get("username"),
      bio: form.get("bio"),
      avatarUrl: form.get("avatarUrl")
    };

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Unable to save profile");
      }

      const updated = await response.json();
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-900/50 bg-rose-900/20 p-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-slate-400">Loading profile...</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-400">Update your account details and preferences.</p>
      </header>
      <form className="grid gap-4 rounded-2xl border border-slate-900 bg-slate-900/40 p-6" onSubmit={handleSave}>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Email</span>
          <input value={profile.email} readOnly className="rounded-lg bg-slate-800 px-4 py-2 text-slate-500" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Username</span>
          <input
            name="username"
            defaultValue={profile.username}
            required
            minLength={3}
            className="rounded-lg bg-slate-800 px-4 py-2 text-slate-100"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Avatar URL</span>
          <input
            name="avatarUrl"
            defaultValue={profile.avatarUrl}
            className="rounded-lg bg-slate-800 px-4 py-2 text-slate-100"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Bio</span>
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={4}
            className="rounded-lg bg-slate-800 px-4 py-2 text-slate-100"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 max-w-fit rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
