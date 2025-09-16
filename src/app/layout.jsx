import { ApolloWrapper } from "./components/ApolloWrapper"
import { env } from "./lib/env"
import "./globals.css"

export const metadata = {
  title: env.APP_NAME,
  description: "C&G's Stories",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  )
}
