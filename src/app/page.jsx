"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { validatePassword } from "./lib/password-check"
import logo from "./assets/logos/logo-midnight.png"

export default function LoginPage() {
  const [pin, setPin] = useState("")
  const [status, setStatus] = useState("")

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("Checking PIN...")

    // Optional: validate PIN against env hash
    const isValid = await validatePassword(pin)
    if (isValid) {
      setStatus("✅ Access Granted")
      // redirect or load the protected page
      router.push("/editor")
    } else {
      setStatus("Invalid PIN")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-pastel-pink-500">
      <div className="flex flex-col items-center w-full max-w-xs px-4">
        {/* Logo */}
        <div className="mb-4">
          {/* Replace with your SVG or <Image /> */}
          <Image src={logo} alt="Logo" width={100} height={100} />
        </div>

        {/* App Name */}
        <h1 className="text-xl font-serif font-semibold text-carbon-blue-500 mb-6">
          App Name
        </h1>

        {/* PIN Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-3"
        >
          <input
            type="password"
            placeholder="Password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-md px-4 py-2 cursor-pointer bg-neutral-100 text-gray-800 text-center outline-none focus:ring-2 focus:ring-carbon-blue-500"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-carbon-blue-500 text-white py-2 font-medium hover:bg-carbon-blue-700 transition"
          >
            Log In
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <p className="mt-3 text-sm text-red-500 text-center">{status}</p>
        )}
      </div>
    </main>
  )
}
