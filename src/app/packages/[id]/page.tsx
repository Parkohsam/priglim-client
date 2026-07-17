"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { gql } from "@apollo/client";
import Link from "next/link";

const GET_PACKAGE = gql`
  query GetPackage($id: ID!) {
    package(id: $id) {
      id
      title
      type
      description
      price
      duration
      bookingOpenDate
      bookingCloseDate
      departureDate
      returnDate
      availabilityStatus
    }
  }
`;

interface PackageDetail {
  id: string;
  title: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  bookingOpenDate: string;
  bookingCloseDate: string;
  departureDate: string;
  returnDate: string;
  availabilityStatus: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PackageDetailPage() {
  const params = useParams();
  const { data, loading, error } = useQuery<{ package: PackageDetail | null }>(
    GET_PACKAGE,
    { variables: { id: params.id } }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-navy-deep/60">Loading...</p>
      </div>
    );
  }

  if (error || !data?.package) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <p className="text-navy-deep mb-4">
          This package could not be found.
        </p>
        <Link href="/packages" className="text-navy font-medium">
          Back to packages
        </Link>
      </div>
    );
  }

  const pkg = data.package;
  const isBookable = pkg.availabilityStatus === "open";

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/packages" className="text-navy text-sm font-medium">
          ← Back to packages
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
          <div className="h-2 bg-navy" />

          <div className="p-8">
            <span className="inline-block text-xs font-medium text-gold uppercase tracking-wide mb-2">
              {pkg.type.replace("_", " ")}
            </span>
            <h1 className="text-2xl font-bold text-navy-deep mb-4">
              {pkg.title}
            </h1>
            <p className="text-navy-deep/70 mb-6">{pkg.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-navy-deep/50">Price</p>
                <p className="text-navy-deep font-semibold">
                  ₦{pkg.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-navy-deep/50">Duration</p>
                <p className="text-navy-deep font-semibold">{pkg.duration}</p>
              </div>
              <div>
                <p className="text-navy-deep/50">Departure</p>
                <p className="text-navy-deep font-semibold">
                  {formatDate(pkg.departureDate)}
                </p>
              </div>
              <div>
                <p className="text-navy-deep/50">Return</p>
                <p className="text-navy-deep font-semibold">
                  {formatDate(pkg.returnDate)}
                </p>
              </div>
            </div>

            <p className="text-xs text-navy-deep/50 mb-6">
              Bookings open {formatDate(pkg.bookingOpenDate)} until{" "}
              {formatDate(pkg.bookingCloseDate)}
            </p>

            <button
              disabled={!isBookable}
              className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isBookable ? "Book Now" : "Not currently available"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}