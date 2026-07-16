"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="h-2 bg-navy" />

        <div className="p-8">
          <h1 className="text-2xl font-bold text-navy-deep mb-1">
            Create your account
          </h1>
          <p className="text-sm text-navy-deep/60 mb-6">
            Start planning your Hajj or Umrah journey
          </p>

          {error && (
            <p className="text-red text-sm mb-4 font-medium">
              {error === "Firebase: Error (auth/email-already-in-use)."
                ? "That email is already registered. Try logging in instead."
                : error}
            </p>
          )}

          <label className="block text-sm font-medium text-navy-deep mb-1">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-4 text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy"
          />

          <label className="block text-sm font-medium text-navy-deep mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-4 text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy"
          />

          <label className="block text-sm font-medium text-navy-deep mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-6 text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}