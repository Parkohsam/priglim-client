"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_PACKAGES } from "@/graphql/queries";

interface PackageCard {
  id: string;
  title: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  availabilityStatus: string;
  images: string[];
}

export default function PackagesPage() {
  const { data, loading, error } = useQuery<{ packages: PackageCard[] }>(GET_PACKAGES);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-navy-deep/60">Loading packages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <p className="text-red text-sm mb-4">Failed to load packages.</p>
        <Link href="/" className="text-navy font-medium">Back to home</Link>
      </div>
    );
  }

  const packages = data?.packages ?? [];
  const openPackages = packages.filter((p) => p.availabilityStatus === "open");

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-navy font-medium">← Back to home</Link>
        <h1 className="text-3xl font-bold text-navy-deep mt-6 mb-2">Packages</h1>
        <p className="text-navy-deep/60 mb-8">Browse our Hajj and Umrah offerings.</p>

        {packages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-navy-deep/60">No packages available yet.</p>
          </div>
        ) : (
          <>
            {openPackages.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {openPackages.map((pkg) => (
                  <Link key={pkg.id} href={`/packages/${pkg.id}`} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {pkg.images?.[0] ? (
                      <div className="h-44 bg-navy-deep">
                        <img src={pkg.images[0]} alt={pkg.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-44 bg-navy" />
                    )}
                    <div className="p-5">
                      <span className="text-xs font-medium text-gold uppercase tracking-wide">{pkg.type.replace("_", " ")}</span>
                      <h3 className="font-bold text-navy-deep mt-1 mb-2">{pkg.title}</h3>
                      <p className="text-sm text-navy-deep/60 line-clamp-2 mb-3">{pkg.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-navy">₦{pkg.price.toLocaleString()}</span>
                        <span className="text-navy-deep/60">{pkg.duration}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {packages.filter((p) => p.availabilityStatus !== "open").length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-navy-deep mb-4">Other packages</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                  {packages.filter((p) => p.availabilityStatus !== "open").map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-lg shadow-sm p-5">
                      <span className="text-xs text-navy-deep/50 uppercase">{pkg.type.replace("_", " ")} · {pkg.availabilityStatus}</span>
                      <h3 className="font-semibold text-navy-deep mt-1">{pkg.title}</h3>
                      <p className="text-sm text-navy-deep/50 mt-1">₦{pkg.price.toLocaleString()} · {pkg.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
