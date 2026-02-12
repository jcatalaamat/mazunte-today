"use client";

import { useState } from "react";

export function AdminLogin({ onLogin }: { onLogin: (password: string) => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await onLogin(password);

    if (!success) {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl text-center mb-2">Admin Access</h1>
        <p className="text-text-soft text-sm text-center mb-8">
          Enter the admin password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream font-sans text-[0.9rem] outline-none focus:border-ocean transition-colors"
          />
          {error && <p className="text-sunset text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
