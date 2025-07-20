// lib/apollo-provider.jsx
"use client"

import { ApolloProvider } from "@apollo/client"
import { client } from "./../lib/apollo-client"

export function ApolloWrapper({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
