"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      fullName
      email
      role
      createdAt
    }
  }
`;

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-navy/10 text-navy",
  user: "bg-gray-100 text-gray-700",
};

function UsersContent() {
  const { data, loading, error } = useQuery<{ users: UserRow[] }>(GET_USERS);

  return (
    <div className="min-h-screen bg-cream px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-navy-deep mb-8">Users</h1>

        {loading && <p className="text-navy-deep/60">Loading...</p>}
        {error && <p className="text-red text-sm">Failed to load users.</p>}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-deep/10 text-left">
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Name</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Email</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Role</th>
                  <th className="px-4 py-3 font-medium text-navy-deep/60">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((u) => (
                  <tr key={u.id} className="border-b border-navy-deep/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-navy-deep whitespace-nowrap">
                      {u.fullName}
                    </td>
                    <td className="px-4 py-3 text-navy-deep/70 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                          roleColors[u.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-deep/50 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data?.users.length === 0 && (
              <p className="text-navy-deep/60 text-sm px-4 py-6">No users yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <UsersContent />
      </AdminLayout>
    </AdminGuard>
  );
}