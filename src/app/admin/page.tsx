"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PACKAGES } from "@/graphql/queries";
import { gql } from "@apollo/client";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";

const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    allBookings {
      id
      status
      paymentStatus
      totalAmount
    }
  }
`;

interface Package {
  id: string;
  availabilityStatus: string;
}

interface Booking {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

function DashboardContent() {
  const { data: packagesData, loading: packagesLoading } = useQuery<{
    packages: Package[];
  }>(GET_PACKAGES);
  const { data: bookingsData, loading: bookingsLoading } = useQuery<{
    allBookings: Booking[];
  }>(GET_ALL_BOOKINGS);

  const loading = packagesLoading || bookingsLoading;

  const totalPackages = packagesData?.packages.length || 0;
  const openPackages =
    packagesData?.packages.filter((p) => p.availabilityStatus === "open")
      .length || 0;

  const totalBookings = bookingsData?.allBookings.length || 0;
  const pendingReview =
    bookingsData?.allBookings.filter((b) => b.status === "paid_pending_review")
      .length || 0;
  const totalRevenue =
    bookingsData?.allBookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalAmount, 0) || 0;

  const stats = [
    { label: "Total Packages", value: totalPackages },
    { label: "Open for Booking", value: openPackages },
    { label: "Total Bookings", value: totalBookings },
    { label: "Awaiting Review", value: pendingReview, highlight: pendingReview > 0 },
  ];

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-navy-deep mb-8">Dashboard</h1>

        {loading ? (
          <p className="text-navy-deep/60">Loading...</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-white rounded-lg shadow-sm p-5 ${
                    stat.highlight ? "border-l-4 border-red" : ""
                  }`}
                >
                  <p className="text-sm text-navy-deep/60 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-navy-deep">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5">
              <p className="text-sm text-navy-deep/60 mb-1">
                Total Revenue (paid bookings only)
              </p>
              <p className="text-2xl font-bold text-navy-deep">
                ₦{totalRevenue.toLocaleString()}
              </p>
            </div>

            {pendingReview > 0 && (
              <p className="text-sm text-navy-deep/70 mt-6">
                You have {pendingReview} booking
                {pendingReview > 1 ? "s" : ""} awaiting confirmation review.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </AdminGuard>
  );
}