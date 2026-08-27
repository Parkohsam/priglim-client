"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";

const GET_ALL_BOOKINGS = gql`
  query GetAllBookingsFull {
    allBookings {
      id
      numberOfPilgrims
      totalAmount
      status
      visaStatus
      paymentStatus
      refundStatus
      createdAt
      package {
        title
      }
      user {
        fullName
        email
      }
    }
  }
`;

interface Booking {
  id: string;
  numberOfPilgrims: number;
  totalAmount: number;
  status: string;
  visaStatus: string;
  paymentStatus: string;
  refundStatus: string;
  createdAt: string;
  package: { title: string } | null;
  user: { fullName: string; email: string } | null;
}

const statusColors: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  paid_pending_review: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

function BookingsContent() {
  const { data, loading, error } = useQuery<{ allBookings: Booking[] }>(
    GET_ALL_BOOKINGS
  );

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-navy-deep mb-8">Bookings</h1>

        {loading && <p className="text-navy-deep/60">Loading...</p>}
        {error && (
          <p className="text-red text-sm">Failed to load bookings.</p>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-deep/10 text-left">
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Customer</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Package</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Pilgrims</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Amount</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Status</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Payment</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Visa</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.allBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-navy-deep/5 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-navy-deep">
                        {booking.user?.fullName ?? "Deleted user"}
                      </p>
                      <p className="text-xs text-navy-deep/50">
                        {booking.user?.email ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-navy-deep/70 whitespace-nowrap">
                      {booking.package?.title ?? (
                        <span className="italic text-navy-deep/40">Package removed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-deep/70">
                      {booking.numberOfPilgrims}
                    </td>
                    <td className="px-4 py-3 text-navy-deep/70 whitespace-nowrap">
                      ₦{booking.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {booking.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-deep/70 capitalize whitespace-nowrap">
                      {booking.paymentStatus}
                    </td>
                    <td className="px-4 py-3 text-navy-deep/70 capitalize whitespace-nowrap">
                      {booking.visaStatus.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-navy-deep/50 text-xs whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data?.allBookings.length === 0 && (
              <p className="text-navy-deep/60 text-sm px-4 py-6">
                No bookings yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <BookingsContent />
      </AdminLayout>
    </AdminGuard>
  );
}