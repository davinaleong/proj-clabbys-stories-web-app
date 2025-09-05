"use client"

import { useState } from "react"
import Image from "next/image"
import { useMutation } from "@apollo/client"
import logo from "./../assets/logos/logo-midnight.png"
import iconEye from "./../assets/icons/eye.svg"
import iconEyeClosed from "./../assets/icons/eye-closed.svg"

export default function PinGate({
  galleryId,
  onSuccess,
  appName,
  VERIFY_GALLERY_PIN,
}) {
  const [passphrase, setPassphrase] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [verify, { loading }] = useMutation(VERIFY_GALLERY_PIN)

  async function submit() {
    setError("")
    if (!passphrase.trim()) {
      setError("Please enter the passphrase.")
      return
    }
    try {
      const { data } = await verify({
        variables: { id: galleryId, pin: passphrase },
      })
      const res = data?.verifyGalleryPin
      if (res?.ok && res?.token) {
        onSuccess(res.token)
      } else {
        setError(res?.message || "Invalid passphrase. Try again.")
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Try again."
      setError(msg)
    }
  }

  return (
    <div
      className="min-h-[100svh] flex items-center justify-center px-6"
      style={{ background: "#FAD7D7" }}
    >
      <div className="w-full max-w-sm text-center">
        <Image
          src={logo}
          alt="Logo"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h1 className="text-4xl font-serif text-[#1C2440] mb-6">
          {appName || "Clabby's Stories"}
        </h1>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Passphrase"
            value={passphrase}
            autoComplete="current-password"
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full bg-[#F2F4F5] rounded-sm px-4 py-3 pr-12 text-[#1C2440] placeholder:text-[#1C2440]/70 outline-none"
            aria-label="Passphrase"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-[#1C2440]/70 hover:text-[#1C2440] focus:outline-none"
            aria-label={show ? "Hide passphrase" : "Show passphrase"}
            title={show ? "Hide passphrase" : "Show passphrase"}
          >
            <Image
              src={show ? iconEyeClosed : iconEye}
              alt={show ? "Hide" : "Show"}
              width={22}
              height={22}
            />
          </button>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-4 w-full bg-carbon-blue-500 hover:bg-carbon-blue-700 rounded-sm text-white py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "Checking…" : "Enter"}
        </button>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  )
}
