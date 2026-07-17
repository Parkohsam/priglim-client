"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PACKAGES } from "@/graphql/queries";
import { CREATE_PACKAGE, SET_PACKAGE_AVAILABILITY, DELETE_PACKAGE } from "@/graphql/mutations";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";

interface Package {
  id: string;
  title: string;
  type: string;
  price: number;
  duration: string;
  availabilityStatus: string;
}

function AdminPackagesContent() {
  const { data, loading, refetch } = useQuery<{ packages: Package[] }>(GET_PACKAGES);
  const [createPackage, { loading: creating }] = useMutation(CREATE_PACKAGE);
  const [setAvailability] = useMutation(SET_PACKAGE_AVAILABILITY);
  const [deletePackage] = useMutation(DELETE_PACKAGE);

  const [form, setForm] = useState({
    title: "",
    type: "umrah",
    description: "",
    price: "",
    duration: "",
    bookingOpenDate: "",
    bookingCloseDate: "",
    departureDate: "",
    returnDate: "",
  });
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createPackage({
        variables: {
          input: {
            ...form,
            price: parseFloat(form.price),
            images: [],
            itinerary: [],
          },
        },
      });
      setForm({
        title: "",
        type: "umrah",
        description: "",
        price: "",
        duration: "",
        bookingOpenDate: "",
        bookingCloseDate: "",
        departureDate: "",
        returnDate: "",
      });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create package.");
    }
  }

  async function handleStatusChange(id: string, availabilityStatus: string) {
    await setAvailability({ variables: { id, availabilityStatus } });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this package permanently?")) return;
    await deletePackage({ variables: { id } });
    refetch();
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-navy-deep mb-8">
          Manage Packages
        </h1>

        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg shadow-md p-6 mb-10"
        >
          <h2 className="font-semibold text-navy-deep mb-4">Create New Package</h2>

          {error && <p className="text-red text-sm mb-4">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="border border-navy-deep/20 rounded px-3 py-2"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-navy-deep/20 rounded px-3 py-2"
            >
              <option value="umrah">Umrah</option>
              <option value="ramadan_umrah">Ramadan Umrah</option>
              <option value="hajj">Hajj</option>
            </select>
            <input
              placeholder="Price (NGN)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="border border-navy-deep/20 rounded px-3 py-2"
            />
            <input
              placeholder="Duration (e.g. 10 days)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
              className="border border-navy-deep/20 rounded px-3 py-2"
            />
          </div>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-4"
            rows={3}
          />

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-navy-deep/60 mb-1">Booking Opens</label>
              <input
                type="date"
                value={form.bookingOpenDate}
                onChange={(e) => setForm({ ...form, bookingOpenDate: e.target.value })}
                required
                className="w-full border border-navy-deep/20 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-navy-deep/60 mb-1">Booking Closes</label>
              <input
                type="date"
                value={form.bookingCloseDate}
                onChange={(e) => setForm({ ...form, bookingCloseDate: e.target.value })}
                required
                className="w-full border border-navy-deep/20 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-navy-deep/60 mb-1">Departure Date</label>
              <input
                type="date"
                value={form.departureDate}
                onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                required
                className="w-full border border-navy-deep/20 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-navy-deep/60 mb-1">Return Date</label>
              <input
                type="date"
                value={form.returnDate}
                onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                required
                className="w-full border border-navy-deep/20 rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="bg-navy hover:bg-navy-deep text-white font-medium rounded px-6 py-2.5 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Package"}
          </button>
        </form>

        <h2 className="font-semibold text-navy-deep mb-4">Existing Packages</h2>

        {loading && <p className="text-navy-deep/60">Loading...</p>}

        <div className="space-y-3">
          {data?.packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-navy-deep">{pkg.title}</p>
                <p className="text-sm text-navy-deep/60">
                  {pkg.type.replace("_", " ")} · ₦{pkg.price.toLocaleString()} · {pkg.duration}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pkg.availabilityStatus}
                  onChange={(e) => handleStatusChange(pkg.id, e.target.value)}
                  className="text-sm border border-navy-deep/20 rounded px-2 py-1"
                >
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="text-red text-sm font-medium px-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPackagesPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPackagesContent />
      </AdminLayout>
    </AdminGuard>
  );
}