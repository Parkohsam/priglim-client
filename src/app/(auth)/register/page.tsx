"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {createUserWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,AuthError,} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useMutation } from "@apollo/client/react";
import { SYNC_USER } from "@/graphql/mutations";
import Link from "next/link";

interface SyncUserResponse {
  syncUser: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

interface SyncUserVariables {
  fullName: string;
  phone?: string;
}

interface MutationResult {
  data: SyncUserResponse | undefined;
}

const googleProvider = new GoogleAuthProvider();

function getFirebaseErrorMessage(err: unknown): string {
  const code = (err as AuthError)?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function RegisterContent() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncUser] = useMutation<SyncUserResponse, SyncUserVariables>(SYNC_USER);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password.length > 128) {
      setError("Password must be at most 128 characters.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      try {
        await syncUser({ variables: { fullName: trimmedName } });
        router.push("/");
      } catch {
        // Firebase account was created successfully; the backend sync
        // failed but will retry automatically on next login (see
        // resolvers/userResolvers.js). Don't scare the user — just point
        // them at login instead of showing a raw error.
        setError(
          "Account created! Please log in to finish setting up your account."
        );
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      try {
        await syncUser({
          variables: { fullName: result.user.displayName || "Priglim User" },
        });
        router.push("/");
      } catch {
        setError(
          "Account created! Please log in to finish setting up your account."
        );
      }
    } catch (err) {
      const code = (err as AuthError)?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // User closed the popup themselves.
      } else {
        setError("Google sign-up failed. Please try again.");
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
            <p className="text-red text-sm mb-4 font-medium">{error}</p>
          )}

          <label className="block text-sm font-medium text-navy-deep mb-1">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
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
            autoComplete="email"
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
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-6 text-navy-deep focus:outline-none focus:ring-2 focus:ring-navy"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-navy-deep/10 flex-1" />
            <span className="text-xs text-navy-deep/40">OR</span>
            <div className="h-px bg-navy-deep/10 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full border border-navy-deep/20 text-navy-deep font-medium rounded py-2.5 hover:bg-cream transition-colors disabled:opacity-50"
          >
            Continue with Google
          </button>

          <p className="text-sm text-navy-deep/60 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-navy font-medium">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}