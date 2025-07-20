import { ApolloProvider } from "@apollo/client"
import { Montserrat, Playfair } from "next/font/google"
import { env } from "./lib/env"
import { client } from "./lib/apollo-client"
import "./globals.css"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
})

const playfair = Playfair({
  variable: "--font-playfair",
  subsets: ["latin"],
})

export const metadata = {
  title: env.APP_NAME,
  description: "An editor for Clabby's Stories",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${playfair.variable} antialiased`}
      >
        {/* ✅ ApolloProvider wraps the whole app */}
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </body>
    </html>
  )
}
