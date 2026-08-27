"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { CREATE_BOOKING } from "@/graphql/mutations";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
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
      images
      itinerary
    }
  }
`;

const INITIALIZE_PAYMENT = gql`
  mutation InitializePayment($bookingId: ID!) {
    initializePayment(bookingId: $bookingId) {
      authorizationUrl
      reference
    }
  }
`;

const SUBMIT_BANK_TRANSFER_PROOF = gql`
  mutation SubmitBankTransferProof($bookingId: ID!, $receiptUrl: String!) {
    submitBankTransferProof(bookingId: $bookingId, receiptUrl: $receiptUrl) {
      id
      status
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
  images: string[];
  itinerary: string[];
}

// Cloudinary — unsigned direct-from-browser upload. No backend involved,
// no API secret needed here since the preset is configured as Unsigned
// in the Cloudinary dashboard.
const CLOUDINARY_CLOUD_NAME = "dlcq2g3cu";
const CLOUDINARY_UPLOAD_PRESET = "nszjzbjf";

async function uploadReceiptToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Failed to upload receipt. Please try again.");
  }

  const data = await response.json();
  return data.secure_url;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type BookingStep = "form" | "choosePayment" | "bankTransfer" | "submitted";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error } = useQuery<{ package: PackageDetail | null }>(
    GET_PACKAGE,
    { variables: { id: params.id } }
  );
  const [createBooking, { loading: booking }] = useMutation(CREATE_BOOKING);
  const [initializePayment, { loading: initializingPayment }] = useMutation(INITIALIZE_PAYMENT);
  const [submitBankTransferProof, { loading: submittingProof }] = useMutation(SUBMIT_BANK_TRANSFER_PROOF);

  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<BookingStep>("form");
  const [activeImage, setActiveImage] = useState(0);
  const [numberOfPilgrims, setNumberOfPilgrims] = useState(1);
  const [pilgrims, setPilgrims] = useState([
    { name: "", passportNumber: "", dateOfBirth: "" },
  ]);
  const [bookingError, setBookingError] = useState("");
  const [newBookingId, setNewBookingId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  function handlePilgrimCountChange(count: number) {
    const clamped = Math.min(20, Math.max(1, count || 1));
    setNumberOfPilgrims(clamped);
    setPilgrims((prev) => {
      const updated = [...prev];
      while (updated.length < clamped) {
        updated.push({ name: "", passportNumber: "", dateOfBirth: "" });
      }
      return updated.slice(0, clamped);
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

      setNewBookingId(result.data.createBooking.id);
      setStep("choosePayment");
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to create booking."
      );
    }
  }

  async function handlePayWithPaystack() {
    if (!newBookingId) return;
    setBookingError("");

    try {
      const paymentResult = await initializePayment({
        variables: { bookingId: newBookingId },
      });
      window.location.href = paymentResult.data.initializePayment.authorizationUrl;
    } catch (err: any) {
      const isReauthRequired = err?.graphQLErrors?.some(
        (gqlErr: any) => gqlErr?.extensions?.code === "REAUTH_REQUIRED"
      );

      if (isReauthRequired) {
        await signOut(auth);
        router.push(`/login?redirect=/packages/${params.id}&reason=reauth`);
        return;
      }

      setBookingError(
        err instanceof Error ? err.message : "Failed to start payment."
      );
    }
  }

  async function handleSubmitBankTransfer() {
    if (!newBookingId || !receiptFile) {
      setBookingError("Please choose a receipt image first.");
      return;
    }
    setBookingError("");
    setUploadingReceipt(true);

    try {
      const receiptUrl = await uploadReceiptToCloudinary(receiptFile);
      await submitBankTransferProof({
        variables: { bookingId: newBookingId, receiptUrl },
      });
      setStep("submitted");
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to submit payment proof."
      );
    } finally {
      setUploadingReceipt(false);
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
  const hasImages = pkg.images && pkg.images.length > 0;

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/packages" className="text-navy text-sm font-medium">
          ← Back to packages
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
          {hasImages ? (
            <div>
              <div className="h-64 bg-navy-deep">
                <img
                  src={pkg.images[activeImage]}
                  alt={pkg.title}
                  className="h-full w-full object-contain"
                />
              </div>
              {pkg.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-navy-deep/5 overflow-x-auto">
                  {pkg.images.map((img, i) => (
                    <button
                      key={img + i}
                      onClick={() => setActiveImage(i)}
                      className={`h-14 w-14 shrink-0 rounded overflow-hidden border-2 transition-colors ${
                        activeImage === i ? "border-navy" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-2 bg-navy" />
          )}

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

            {bookingError && bookingError.includes("log in again") ? (
              <div className="bg-navy/5 border border-navy/20 rounded p-4 mb-4">
                <p className="text-navy-deep text-sm mb-3">{bookingError}</p>
                <button
                  onClick={async () => {
                    await signOut(auth);
                    router.push(`/login?redirect=/packages/${params.id}&reason=reauth`);
                  }}
                  className="bg-navy hover:bg-navy-deep text-white text-sm font-medium rounded px-4 py-2 transition-colors"
                >
                  Log in again
                </button>
              </div>
            ) : (
              bookingError && (
                <p className="text-red text-sm mb-4">{bookingError}</p>
              )
            )}

            {/* Step 1: initial CTA / pilgrim form */}
            {step === "form" && !showForm && (
              <button
                disabled={!isBookable}
                onClick={() => {
                  setBookingError("");
                  setShowForm(true);
                }}
                className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isBookable ? "Book Now" : "Not currently available"}
              </button>
            )}

            {step === "form" && showForm && (
              <form onSubmit={handleBookingSubmit} className="border-t border-navy-deep/10 pt-6 mt-6">
                <h2 className="font-semibold text-navy-deep mb-4">
                  Booking details
                </h2>

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
                  {booking ? "Submitting..." : "Continue"}
                </button>
              </form>
            )}

            {/* Step 2: choose payment method */}
            {step === "choosePayment" && (
              <div className="border-t border-navy-deep/10 pt-6 mt-6">
                <h2 className="font-semibold text-navy-deep mb-2">
                  Booking saved — how would you like to pay?
                </h2>
                <p className="text-sm text-navy-deep/60 mb-5">
                  Total due: ₦{(pkg.price * numberOfPilgrims).toLocaleString()}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handlePayWithPaystack}
                    disabled={initializingPayment}
                    className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-3 disabled:opacity-50 transition-colors"
                  >
                    {initializingPayment ? "Redirecting to payment..." : "Pay online (card, bank, USSD)"}
                  </button>

                  <button
                    onClick={() => setStep("bankTransfer")}
                    className="w-full border border-navy-deep/20 hover:border-navy text-navy-deep font-medium rounded py-3 transition-colors"
                  >
                    Pay by bank transfer instead
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: bank transfer details + proof upload */}
            {step === "bankTransfer" && (
              <div className="border-t border-navy-deep/10 pt-6 mt-6">
                <h2 className="font-semibold text-navy-deep mb-2">
                  Pay by bank transfer
                </h2>
                <p className="text-sm text-navy-deep/60 mb-4">
                  If you are unable to complete your payment through our online payment
                  gateway, you can make payment directly to our official business account
                  using a bank transfer.
                </p>

                <div className="bg-cream rounded-lg p-4 mb-5 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-navy-deep/50">Account name</span>
                    <span className="font-semibold text-navy-deep text-right">
                      Abc Travels Logistics And Forwarding Nig Ltd
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-deep/50">Account number</span>
                    <span className="font-semibold text-navy-deep">4006016062</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-deep/50">Bank</span>
                    <span className="font-semibold text-navy-deep">Moniepoint MFB</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-navy-deep/10 mt-2">
                    <span className="text-navy-deep/50">Amount to pay</span>
                    <span className="font-bold text-navy-deep">
                      ₦{(pkg.price * numberOfPilgrims).toLocaleString()}
                    </span>
                  </div>
                </div>

                <label className="block text-sm font-medium text-navy-deep mb-1">
                  Upload your transfer receipt
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-4 text-sm"
                />

                <button
                  onClick={handleSubmitBankTransfer}
                  disabled={!receiptFile || uploadingReceipt || submittingProof}
                  className="w-full bg-navy hover:bg-navy-deep text-white font-medium rounded py-3 disabled:opacity-50 transition-colors"
                >
                  {uploadingReceipt
                    ? "Uploading receipt..."
                    : submittingProof
                    ? "Submitting..."
                    : "I've made the transfer"}
                </button>

                <button
                  onClick={() => setStep("choosePayment")}
                  className="w-full text-navy-deep/60 text-sm mt-3"
                >
                  ← Back to payment options
                </button>
              </div>
            )}

            {/* Step 4: submitted, awaiting admin review */}
            {step === "submitted" && (
              <div className="bg-navy/5 border border-navy/20 rounded p-4 mt-6">
                <p className="text-navy-deep font-semibold mb-1">
                  Payment proof submitted
                </p>
                <p className="text-sm text-navy-deep/70">
                  We've received your receipt and will confirm your booking shortly.
                  You'll get an email once it's reviewed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}