"use client"

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { env } from "./env"

const httpLink = new HttpLink({
  uri: env.GQL_API_URL || "http://localhost:4000/graphql",
  credentials: "include", // 🚨 This is key for sending cookies
})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          galleries: {
            merge: false,
          },
        },
      },
      Gallery: {
        keyFields: ["id"],
      },
      Photo: {
        keyFields: ["id"],
      },
    },
  }),
})
