"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useQuery } from "@apollo/client/react";
import { GET_ME } from "@/graphql/queries";
import { useState, useEffect, ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Packages", href: "/admin/packages" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Users", href: "/admin/users" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data } = useQuery<{ me: { fullName: string; email: string } | null }>(
    GET_ME
  );

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, []);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside
        className={`${
          collapsed ? "w-16" : "w-56"
        } bg-navy-deep text-white flex flex-col transition-all duration-200`}
      >
        <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
          {!collapsed && <p className="font-bold text-sm">Priglim Admin</p>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/70 hover:text-white p-1"
            aria-label="Toggle sidebar"
          >
            {collapsed ? "☰" : "✕"}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`block px-3 py-2 rounded text-sm mb-1 transition-colors ${
                  isActive
                    ? "bg-navy text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {collapsed ? item.label.charAt(0) : item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-navy-deep/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <p className="text-sm text-navy-deep/60 truncate">
            {data?.me?.fullName || data?.me?.email}
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-red font-medium whitespace-nowrap"
          >
            Log out
          </button>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}