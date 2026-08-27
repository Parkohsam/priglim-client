"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <header className="bg-white border-b border-navy-deep/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-navy-deep text-lg">
            Priglim
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/packages" className="text-sm text-navy-deep/70 hover:text-navy-deep">
              Packages
            </Link>
            <Link href="/#about" className="text-sm text-navy-deep/70 hover:text-navy-deep">
              About
            </Link>
            <Link href="/#contact" className="text-sm text-navy-deep/70 hover:text-navy-deep">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <button
                onClick={handleLogout}
                className="text-sm text-navy-deep/70 hover:text-navy-deep"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-navy-deep px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-navy hover:bg-navy-deep text-white rounded px-4 py-2 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-navy-deep text-xl"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/packages" className="text-sm text-navy-deep/70">
              Packages
            </Link>
            <Link href="/#about" className="text-sm text-navy-deep/70">
              About
            </Link>
            <Link href="/#contact" className="text-sm text-navy-deep/70">
              Contact
            </Link>
            {user ? (
              <button onClick={handleLogout} className="text-sm text-left text-navy-deep/70">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-navy-deep/70">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm text-navy-deep/70">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}