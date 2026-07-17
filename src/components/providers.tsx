"use client";

import { ApolloProvider } from "@apollo/client/react";
import apolloClient from "@/lib/apolloClient";
import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}