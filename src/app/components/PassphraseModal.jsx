"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { gql, useMutation } from "@apollo/client"

// ✅ Icons (paths are from /components → /assets)
import iconWand from "../assets/icons/wand.svg"
import iconBan from "../assets/icons/ban-w.svg"
import iconCheck from "../assets/icons/check.svg"

// ✅ Dedicated mutation (same shape you had)
const SET_GALLERY_PASSPHRASE = gql`
  mutation SetGalleryPassphrase($id: ID!, $passphrase: String!) {
    setGalleryPassphrase(id: $id, passphrase: $passphrase) {
      id
    }
  }
`

/**
 * PassphraseModal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - galleryId: string
 * - seed?: string             // initial input value
 * - onSaved?: (pass: string) => void
 * - generatePassphrase?: () => string
 */
export default function PassphraseModal({
  open,
  onClose,
  galleryId,
  seed = "",
  onSaved,
  generatePassphrase,
}) {
  const [value, setValue] = useState(typeof seed === "string" ? seed : "")
  const [saving, setSaving] = useState(false)

  const [setGalleryPassphrase] = useMutation(SET_GALLERY_PASSPHRASE)

  useEffect(() => {
    if (open) setValue(seed ?? "")
  }, [open, seed])

  if (!open) return null

  const handleGenerate = () => {
    if (typeof generatePassphrase === "function") {
      setValue(generatePassphrase())
    }
  }

  const handleSave = async () => {
    const pass = (value || "").trim()
    if (pass.length < 4) return // Keep UI validation in parent toast

    try {
      setSaving(true)
      await setGalleryPassphrase({
        variables: { id: galleryId, passphrase: pass },
      })
      onClose?.()
      onSaved?.(pass)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* card */}
      <div className="relative z-10 w-[90%] max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 className="font-serif text-2xl font-bold text-carbon-blue-700 mb-3">
          Set Passphrase
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-carbon-blue-400"
            placeholder="Enter a passphrase"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex gap-2 px-3 py-2 rounded-md bg-neutral-200 hover:bg-neutral-300"
              onClick={handleGenerate}
              title="Generate a random passphrase"
            >
              <Image src={iconWand} alt="Wand Icon" width={16} height={16} />
              Generate
            </button>

            <div className="flex-1" />

            <button
              type="button"
              className="inline-flex gap-2 px-4 py-2 rounded-md bg-neutral-500 text-white hover:bg-neutral-700"
              onClick={onClose}
              disabled={saving}
            >
              <Image src={iconBan} alt="Ban Icon" width={16} height={16} />
              Cancel
            </button>

            <button
              type="button"
              className="inline-flex gap-2 px-4 py-2 rounded-md bg-carbon-blue-500 text-white hover:bg-carbon-blue-700 disabled:opacity-60"
              onClick={handleSave}
              disabled={saving || (value || "").trim().length < 4}
            >
              <Image src={iconCheck} alt="Check Icon" width={16} height={16} />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Tip: Keep this secret. Share only with guests who should access the
            gallery.
          </p>
        </div>
      </div>
    </div>
  )
}
