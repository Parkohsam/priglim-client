"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useMutation } from "@apollo/client/react";
import { SYNC_USER } from "@/graphql/mutations";
import Link from "next/link";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncUser] = useMutation(SYNC_USER);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("MY TOKEN:", await result.user.getIdToken());
      await syncUser({
        variables: { fullName: result.user.displayName || "Priglim User" },
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? "Incorrect email or password. Please try again."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUser({
        variables: { fullName: result.user.displayName || "Priglim User" },
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? "Google sign-in failed. Please try again."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-2 bg-navy" />

        <div className="p-8">
          <h1 className="text-2xl font-bold text-navy-deep mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-navy-deep/60 mb-6">
            Sign in to continue your journey
          </p>

          {error && (
            <p className="text-red text-sm mb-4 font-medium">{error}</p>
          )}

          <form onSubmit={handleEmailLogin}>
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
              className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-6 text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-2.5 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-navy-deep/10 flex-1" />
            <span className="text-xs text-navy-deep/40">OR</span>
            <div className="h-px bg-navy-deep/10 flex-1" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-navy-deep/20 text-navy-deep font-medium rounded py-2.5 hover:bg-cream transition-colors disabled:opacity-50"
          >
            Continue with Google
          </button>

          <p className="text-sm text-navy-deep/60 mt-6 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-navy font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}