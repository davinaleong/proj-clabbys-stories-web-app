"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import { env } from "./lib/env"
import logo from "./assets/logos/logo-midnight.png"
import iconEye from "./assets/icons/eye.svg"
import iconEyeClosed from "./assets/icons/eye-closed.svg"

// ✅ GraphQL Login Mutation
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
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
  const [showPassword, setShowPassword] = useState(false) // ✅ toggle state
  const [status, setStatus] = useState("")

  const router = useRouter()

  // Apollo mutation hook
  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    context: { fetchOptions: { credentials: "include" } }, // ✅ allow cookies
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("Logging in...")

    try {
      const { data } = await loginUser({ variables: { email, password } })
      if (data?.loginUser?.user) {
        setStatus(`Welcome, ${data.loginUser.user.name}!`)
        router.push("/editor") // ✅ Redirect after cookie is set
      } else {
        setStatus("Invalid credentials")
      }
    } catch (err) {
      console.error(err)
      setStatus("Login failed. Check email & password.")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pastel-pink-500">
      <section className="flex flex-col items-center w-full max-w-xs px-4">
        {/* Header / Logo */}
        <header className="flow mb-4">
          <div className="flex justify-center">
            <Image src={logo} alt="Logo" width={100} height={100} />
          </div>
          <h1 className="text-3xl text-center font-serif font-semibold text-carbon-blue-500">
            {env.APP_NAME}
          </h1>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-3"
        >
          {/* Email Field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md px-4 py-2 bg-neutral-100 text-gray-800 text-center outline-none focus:ring-2 focus:ring-carbon-blue-500"
            required
          />

          {/* Password Field with Eye Toggle */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-4 py-2 bg-neutral-100 text-gray-800 text-center outline-none focus:ring-2 focus:ring-carbon-blue-500"
              required
            />

            {/* Eye Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 flex items-center"
            >
              <Image
                src={showPassword ? iconEyeClosed : iconEye}
                alt={showPassword ? "Hide password" : "Show password"}
                width={20}
                height={20}
              />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-carbon-blue-500 text-white py-2 font-medium hover:bg-carbon-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Status Message */}
          {status && (
            <p className="mt-3 text-sm text-carbon-blue-500 text-center">
              {status}
            </p>
          )}
        </form>

        {/* Footer */}
        <footer className="mt-4">
          <p className="text-sm text-center">
            This site uses a secure, essential cookie for login authentication.
            No tracking or advertising cookies are used. By continuing to use
            this site, you agree to our{" "}
            <Link
              href="/privacy"
              className="text-carbon-blue-500 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </section>
    </main>
  )
}
