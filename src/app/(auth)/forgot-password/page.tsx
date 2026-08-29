"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setStatus("sent");
    } catch {
      setError("Unable to send reset link right now. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-2 bg-navy" />

        <div className="p-8">
          <h1 className="text-2xl font-bold text-navy-deep mb-1">
            Reset your password
          </h1>
          <p className="text-sm text-navy-deep/60 mb-6">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>

          {status === "sent" ? (
            <div className="bg-navy/5 border border-navy/20 rounded p-4">
              <p className="text-navy-deep text-sm font-medium mb-1">
                Check your inbox
              </p>
              <p className="text-navy-deep/70 text-sm">
                If an account exists for <strong>{email}</strong>, a reset
                link has been sent. It may take a minute to arrive.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <p className="text-red text-sm mb-4 font-medium">{error}</p>
              )}

              <label className="block text-sm font-medium text-navy-deep mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
                className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-4 text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-2.5 transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-sm text-navy-deep/60 mt-6 text-center">
            <Link href="/login" className="text-navy font-medium">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}