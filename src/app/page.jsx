"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import { env } from "./lib/env"
import logo from "./assets/logos/logo-midnight.png"

// ✅ Inline GraphQL mutation for login
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("")

  const router = useRouter()

  // ✅ Apollo mutation hook
  const [loginUser, { loading }] = useMutation(LOGIN_USER)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("Logging in...")

    try {
      const { data } = await loginUser({
        variables: { email, password },
      })

      if (data?.loginUser?.token) {
        // ✅ Store token in localStorage (can switch to cookies later)
        localStorage.setItem("auth_token", data.loginUser.token)

        setStatus(`Welcome, ${data.loginUser.user.name}!`)
        router.push("/editor") // ✅ Redirect to protected page
      } else {
        setStatus("Invalid credentials")
      }
    } catch (err: any) {
      console.error(err)
      setStatus("Login failed. Check email & password.")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pastel-pink-500">
      <div className="flex flex-col items-center w-full max-w-xs px-4">
        {/* Logo */}
        <div className="mb-4">
          <Image src={logo} alt="Logo" width={100} height={100} />
        </div>

        {/* App Name */}
        <h1 className="text-2xl font-serif font-semibold text-carbon-blue-500 mb-6">
          {env.APP_NAME}
        </h1>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-3"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md px-4 py-2 bg-neutral-100 text-gray-800 text-center outline-none focus:ring-2 focus:ring-carbon-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md px-4 py-2 bg-neutral-100 text-gray-800 text-center outline-none focus:ring-2 focus:ring-carbon-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-carbon-blue-500 text-white py-2 font-medium hover:bg-carbon-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <p className="mt-3 text-sm text-carbon-blue-500 text-center">
            {status}
          </p>
        )}
      </div>
    </main>
  )
}
