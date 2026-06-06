'use client';
import { ApolloProvider } from '@apollo/client';
import { getApolloClient } from '@/lib/apollo-client';

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  // getApolloClient() returns a browser singleton on the client side,
  // and a fresh instance on the server — SSR safe.
  return <ApolloProvider client={getApolloClient()}>{children}</ApolloProvider>;
}
