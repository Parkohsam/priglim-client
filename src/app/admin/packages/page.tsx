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

interface CreatePackageResponse {
  createPackage: Package;
}

interface CreatePackageVariables {
  input: any;
}

interface SetPackageAvailabilityResponse {
  setPackageAvailability: { id: string; availabilityStatus: string };
}

interface SetPackageAvailabilityVariables {
  id: string;
  availabilityStatus: string;
}

interface DeletePackageResponse {
  deletePackage: boolean;
}

interface DeletePackageVariables {
  id: string;
}

// Cloudinary — TODO: migrate to server-signed upload. Uses env vars and validates file.
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dlcq2g3cu";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nszjzbjf";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

async function uploadImageToCloudinary(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File too large — max 5MB.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
  if (!response.ok) throw new Error("Failed to upload image. Please try again.");
  const data = await response.json();
  if (!data.secure_url || !String(data.secure_url).includes("res.cloudinary.com")) throw new Error("Invalid upload response.");
  return data.secure_url;
}

function AdminPackagesContent() {
  const { data, loading, refetch } = useQuery<{ packages: Package[] }>(GET_PACKAGES);
  const [createPackage, { loading: creating }] = useMutation<CreatePackageResponse, CreatePackageVariables>(CREATE_PACKAGE);
  const [setAvailability] = useMutation<SetPackageAvailabilityResponse, SetPackageAvailabilityVariables>(SET_PACKAGE_AVAILABILITY);
  const [deletePackage] = useMutation<DeletePackageResponse, DeletePackageVariables>(DELETE_PACKAGE);

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
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createPackage({
        variables: {
          input: {
            title: form.title,
            type: form.type,
            description: form.description,
            price: parseFloat(form.price),
            duration: form.duration,
            bookingOpenDate: form.bookingOpenDate,
            bookingCloseDate: form.bookingCloseDate,
            departureDate: form.departureDate,
            returnDate: form.returnDate,
            images: form.imageUrl ? [form.imageUrl] : [],
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
        imageUrl: "",
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
    try {
      await deletePackage({ variables: { id } });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete package.");
    }
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

          <label className="block text-xs text-navy-deep/60 mb-1">
            Package image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full border border-navy-deep/20 rounded px-3 py-2 mb-2 text-sm"
          />
          {uploadingImage && (
            <p className="text-xs text-navy-deep/50 mb-4">Uploading image...</p>
          )}
          {form.imageUrl && !uploadingImage && (
            <div className="mb-4">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="h-32 rounded border border-navy-deep/10 object-cover"
              />
            </div>
          )}

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
            disabled={creating || uploadingImage}
            className="bg-navy hover:bg-navy-deep text-white font-medium rounded px-6 py-2.5 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Package"}
          </button>
        </form>

        <h2 className="font-semibold text-navy-deep mb-4">Existing Packages</h2>

        {loading && <p className="text-navy-deep/60">Loading...</p>}

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-deep/10 text-left">
                <th className="px-4 py-3 font-medium text-navy-deep/60">Title</th>
                <th className="px-4 py-3 font-medium text-navy-deep/60">Type</th>
                <th className="px-4 py-3 font-medium text-navy-deep/60">Price</th>
                <th className="px-4 py-3 font-medium text-navy-deep/60">Duration</th>
                <th className="px-4 py-3 font-medium text-navy-deep/60">Status</th>
                <th className="px-4 py-3 font-medium text-navy-deep/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-navy-deep/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy-deep whitespace-nowrap">
                    {pkg.title}
                  </td>
                  <td className="px-4 py-3 text-navy-deep/70 capitalize whitespace-nowrap">
                    {pkg.type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-navy-deep/70 whitespace-nowrap">
                    ₦{pkg.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-navy-deep/70 whitespace-nowrap">
                    {pkg.duration}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.packages.length === 0 && (
            <p className="text-navy-deep/60 text-sm px-4 py-6">
              No packages yet. Create one above.
            </p>
          )}
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