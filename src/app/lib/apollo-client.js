// lib/apollo-client.js
"use client"

import { ApolloClient, InMemoryCache } from "@apollo/client"
import { env } from "./env"

export const client = new ApolloClient({
  uri: env.API_URL || "http://localhost:4000/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          galleries: {
            merge: false, // don’t merge arrays incorrectly
          },
        },
      },
      Gallery: {
        keyFields: ["id"], // Apollo caches by id
      },
      Photo: {
        keyFields: ["id"],
      },
    },
  }),
})
