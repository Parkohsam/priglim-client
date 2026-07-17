"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ME } from "@/graphql/queries";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface MeData {
  me: { id: string; fullName: string; email: string; role: string } | null;
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading: meLoading } = useQuery<MeData>(GET_ME, {
    skip: !user,
  });

  const isLoading = authLoading || (user && meLoading);
  const isAdmin = data?.me?.role === "admin";

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [isLoading, user, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-navy-deep/60">Checking access...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}