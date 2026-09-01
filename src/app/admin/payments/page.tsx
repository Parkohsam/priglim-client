"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";

const GET_PENDING_REVIEWS = gql`
  query GetPendingPaymentReviews {
    allBookings {
      id
      numberOfPilgrims
      totalAmount
      status
      paymentMethod
      receiptUrl
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

const APPROVE_PAYMENT = gql`
  mutation ApproveBankTransferPayment($bookingId: ID!) {
    approveBankTransferPayment(bookingId: $bookingId) {
      id
      status
      paymentStatus
    }
  }
`;

const REJECT_PAYMENT = gql`
  mutation RejectBankTransferPayment($bookingId: ID!, $reason: String) {
    rejectBankTransferPayment(bookingId: $bookingId, reason: $reason) {
      id
      status
    }
  }
`;

interface Booking {
  id: string;
  numberOfPilgrims: number;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  receiptUrl: string | null;
  createdAt: string;
  package: { title: string } | null;
  user: { fullName: string; email: string } | null;
}

interface ApproveBankTransferPaymentResponse {
  approveBankTransferPayment: {
    id: string;
    status: string;
    paymentStatus: string;
  };
}

interface ApproveBankTransferPaymentVariables {
  bookingId: string;
}

interface RejectBankTransferPaymentResponse {
  rejectBankTransferPayment: {
    id: string;
    status: string;
  };
}

interface RejectBankTransferPaymentVariables {
  bookingId: string;
  reason?: string;
}

function PaymentsContent() {
  const { data, loading, error, refetch } = useQuery<{ allBookings: Booking[] }>(
    GET_PENDING_REVIEWS
  );
  const [approvePayment, { loading: approving }] = useMutation<ApproveBankTransferPaymentResponse, ApproveBankTransferPaymentVariables>(APPROVE_PAYMENT);
  const [rejectPayment, { loading: rejecting }] = useMutation<RejectBankTransferPaymentResponse, RejectBankTransferPaymentVariables>(REJECT_PAYMENT);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const pendingReviews = (data?.allBookings ?? []).filter(
    (b) => b.status === "paid_pending_review"
  );

  async function handleApprove(bookingId: string) {
    setActioningId(bookingId);
    try {
      await approvePayment({ variables: { bookingId } });
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve payment.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(bookingId: string) {
    const reason = window.prompt(
      "Optional: add a note explaining why this is being rejected (shown to the customer)"
    );
    setActioningId(bookingId);
    try {
      await rejectPayment({ variables: { bookingId, reason: reason || undefined } });
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject payment.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-navy-deep mb-2">Payments</h1>
        <p className="text-navy-deep/60 text-sm mb-8">
          Bank transfer payments awaiting manual review. Paystack payments confirm
          automatically and never appear here.
        </p>

        {loading && <p className="text-navy-deep/60">Loading...</p>}
        {error && <p className="text-red text-sm">Failed to load payments.</p>}

        {!loading && !error && pendingReviews.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-navy-deep/60 text-sm">
              Nothing awaiting review right now.
            </p>
          </div>
        )}

        {!loading && !error && pendingReviews.length > 0 && (
          <div className="space-y-4">
            {pendingReviews.map((b) => (
              <div key={b.id} className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-deep">
                      {b.user?.fullName ?? "Deleted user"}
                    </p>
                    <p className="text-xs text-navy-deep/50">{b.user?.email ?? "—"}</p>
                    <p className="text-sm text-navy-deep/70 mt-2">
                      {b.package?.title ?? "Package removed"} · {b.numberOfPilgrims} pilgrim
                      {b.numberOfPilgrims === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm font-semibold text-navy-deep mt-1">
                      ₦{b.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-navy-deep/40 mt-1">
                      Submitted {new Date(b.createdAt).toLocaleDateString("en-NG")}
                    </p>
                  </div>

                  {b.receiptUrl && (
                    <a href={b.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={b.receiptUrl}
                        alt="Payment receipt"
                        className="h-28 w-28 object-cover rounded border border-navy-deep/10"
                      />
                    </a>
                  )}
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-navy-deep/10">
                  <button
                    onClick={() => handleApprove(b.id)}
                    disabled={actioningId === b.id && approving}
                    className="flex-1 bg-navy hover:bg-navy-deep text-white text-sm font-medium rounded py-2 disabled:opacity-50 transition-colors"
                  >
                    {actioningId === b.id && approving ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(b.id)}
                    disabled={actioningId === b.id && rejecting}
                    className="flex-1 border border-red/30 text-red text-sm font-medium rounded py-2 disabled:opacity-50 hover:bg-red/5 transition-colors"
                  >
                    {actioningId === b.id && rejecting ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <PaymentsContent />
      </AdminLayout>
    </AdminGuard>
  );
}