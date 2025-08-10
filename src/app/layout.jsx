import { Montserrat, Playfair } from "next/font/google"
import { ApolloWrapper } from "./components/ApolloWrapper"
import { env } from "./lib/env"
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
  description: "An editor for C&G's Stories",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${playfair.variable} antialiased`}
      >
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  )
}
