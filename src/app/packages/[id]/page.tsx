"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { gql } from "@apollo/client";
import { CREATE_BOOKING } from "@/graphql/mutations";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
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
  const { user } = useAuth();
  const { data, loading, error } = useQuery<{ package: PackageDetail | null }>(
    GET_PACKAGE,
    { variables: { id: params.id } }
  );
  const [createBooking, { loading: booking }] = useMutation(CREATE_BOOKING);

  const [showForm, setShowForm] = useState(false);
  const [numberOfPilgrims, setNumberOfPilgrims] = useState(1);
  const [pilgrims, setPilgrims] = useState([
    { name: "", passportNumber: "", dateOfBirth: "" },
  ]);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<{
    id: string;
    totalAmount: number;
  } | null>(null);

  function handlePilgrimCountChange(count: number) {
    setNumberOfPilgrims(count);
    setPilgrims((prev) => {
      const updated = [...prev];
      while (updated.length < count) {
        updated.push({ name: "", passportNumber: "", dateOfBirth: "" });
      }
      return updated.slice(0, count);
    });
  }

  function updatePilgrim(index: number, field: string, value: string) {
    setPilgrims((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBookingError("");

    if (!user) {
      setBookingError("Please log in to book this package.");
      return;
    }

    try {
      const result = await createBooking({
        variables: {
          input: {
            packageId: params.id,
            numberOfPilgrims,
            pilgrimDetails: pilgrims,
          },
        },
      });
      setBookingSuccess({
        id: result.data.createBooking.id,
        totalAmount: result.data.createBooking.totalAmount,
      });
      setShowForm(false);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking."
      );
    }
  }

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

            {bookingSuccess ? (
              <div className="bg-navy/5 border border-navy/20 rounded p-4">
                <p className="text-navy-deep font-semibold mb-1">
                  Booking submitted
                </p>
                <p className="text-sm text-navy-deep/70 mb-1">
                  Reference: {bookingSuccess.id}
                </p>
                <p className="text-sm text-navy-deep/70">
                  Total due: ₦{bookingSuccess.totalAmount.toLocaleString()}
                </p>
              </div>
            ) : !showForm ? (
              <button
                disabled={!isBookable}
                onClick={() => setShowForm(true)}
                className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isBookable ? "Book Now" : "Not currently available"}
              </button>
            ) : (
              <form onSubmit={handleBookingSubmit} className="border-t border-navy-deep/10 pt-6 mt-6">
                <h2 className="font-semibold text-navy-deep mb-4">
                  Booking details
                </h2>

                {bookingError && (
                  <p className="text-red text-sm mb-4">{bookingError}</p>
                )}

                <label className="block text-sm font-medium text-navy-deep mb-1">
                  Number of pilgrims (max 20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numberOfPilgrims}
                  onChange={(e) => handlePilgrimCountChange(Number(e.target.value))}
                  className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-4"
                />

                {pilgrims.map((pilgrim, i) => (
                  <div key={i} className="mb-4 pb-4 border-b border-navy-deep/5 last:border-0">
                    <p className="text-xs font-medium text-navy-deep/60 mb-2">
                      Pilgrim {i + 1}
                    </p>
                    <input
                      placeholder="Full name"
                      value={pilgrim.name}
                      onChange={(e) => updatePilgrim(i, "name", e.target.value)}
                      required
                      className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-2"
                    />
                    <input
                      placeholder="Passport number"
                      value={pilgrim.passportNumber}
                      onChange={(e) => updatePilgrim(i, "passportNumber", e.target.value)}
                      required
                      className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-2"
                    />
                    <input
                      type="date"
                      value={pilgrim.dateOfBirth}
                      onChange={(e) => updatePilgrim(i, "dateOfBirth", e.target.value)}
                      required
                      className="w-full border border-navy-deep/20 rounded px-3 py-2"
                    />
                  </div>
                ))}

                <p className="text-sm text-navy-deep/70 mb-4">
                  Total: ₦{(pkg.price * numberOfPilgrims).toLocaleString()}
                </p>

                <button
                  type="submit"
                  disabled={booking}
                  className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-3 disabled:opacity-50"
                >
                  {booking ? "Submitting..." : "Confirm Booking"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}