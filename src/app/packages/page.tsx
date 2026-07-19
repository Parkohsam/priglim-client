"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PACKAGES } from "@/graphql/queries";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import { CREATE_BOOKING } from "@/graphql/mutations";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface Package {
  id: string;
  title: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  departureDate: string;
  returnDate: string;
  availabilityStatus: string;
}

export default function PackagesPage() {
  const { data, loading, error } = useQuery<{ packages: Package[] }>(GET_PACKAGES);

  const openPackages = data?.packages.filter(
    (pkg) => pkg.availabilityStatus === "open"
  );

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-navy-deep mb-2">
          Hajj & Umrah Packages
        </h1>
        <p className="text-navy-deep/60 mb-10">
          Find the right journey for you
        </p>

        {loading && (
          <p className="text-navy-deep/60">Loading packages...</p>
        )}

        {error && (
          <p className="text-red">
            Something went wrong loading packages. Please try again.
          </p>
        )}

        {!loading && !error && openPackages?.length === 0 && (
          <p className="text-navy-deep/60">
            No packages are currently open for booking. Check back soon.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {openPackages?.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-2 bg-navy" />
              <div className="p-6">
                <span className="inline-block text-xs font-medium text-gold uppercase tracking-wide mb-2">
                  {pkg.type.replace("_", " ")}
                </span>
                <h2 className="text-lg font-bold text-navy-deep mb-2">
                  {pkg.title}
                </h2>
                <p className="text-sm text-navy-deep/60 mb-4 line-clamp-2">
                  {pkg.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-navy font-bold">
                    ₦{pkg.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-navy-deep/60">
                    {pkg.duration}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}