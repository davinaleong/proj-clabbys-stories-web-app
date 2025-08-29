"use client"

import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"

// ==============================
// ✅ Queries / Mutations
// ==============================
const GET_GALLERY = gql`
  query GetGallery($id: ID!) {
    gallery(id: $id) {
      id
      title
      description
      date
      status
      photos {
        id
        imageUrl
        caption
        takenAt
        position
      }
    }
  }
`

// Rename if your schema uses verifyGalleryPassphrase/verifyGalleryAccess, etc.
const VERIFY_GALLERY_PIN = gql`
  mutation VerifyGalleryPin($id: ID!, $pin: String!) {
    verifyGalleryPin(id: $id, pin: $pin) {
      ok
      token
      message
    }
  }
`

// ==============================
// ✅ Utilities
// ==============================
function formatLongDate(d) {
  if (!d) return ""
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Number.isFinite(+d) ? Number(d) : d))
}

// ==============================
// ✅ Pin Gate (private/public-with-pass)
// ==============================
function PinGate({ galleryId, onSuccess }) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [verify, { loading }] = useMutation(VERIFY_GALLERY_PIN)

  async function submit() {
    setError("")
    if (!pin.trim()) {
      setError("Please enter the PIN.")
      return
    }
    try {
      const { data } = await verify({ variables: { id: galleryId, pin } })
      const res = data?.verifyGalleryPin
      if (res?.ok && res?.token) {
        // keep per-gallery token for refetching
        sessionStorage.setItem(`gallery:${galleryId}:token`, res.token)
        onSuccess(res.token)
      } else {
        setError(res?.message || "Invalid PIN. Try again.")
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div
      className="min-h-[100svh] flex items-center justify-center px-6"
      style={{ background: "#FAD7D7" }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="text-[44px] leading-none mb-3 select-none text-[#1C2440]">
          ♛❤︎
        </div>
        <h1 className="text-4xl font-serif text-[#1C2440] mb-6">App Name</h1>

        <input
          type="password"
          inputMode="numeric"
          placeholder="Pin"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full bg-[#F2F4F5] px-4 py-3 text-[#1C2440] placeholder:text-[#1C2440]/70 outline-none"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="mt-4 w-full bg-black text-white py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "Checking…" : "Enter"}
        </button>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  )
}

// ==============================
// ✅ Lightbox
// ==============================
function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [onClose])

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 text-white text-3xl"
      >
        ×
      </button>

      <div className="h-full w-full flex items-center justify-center px-4">
        {/* Use <img> to avoid domain config for demo; swap to <Image> if domains set */}
        <img
          src={photo.imageUrl}
          alt={photo.caption || ""}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="absolute left-0 right-0 bottom-0 mx-4 mb-6 bg-white p-4 max-w-[680px]">
        <h3 className="text-xl font-semibold mb-1">
          {photo.title || "Photo Title"}
        </h3>
        <p className="text-sm text-neutral-700 mb-2">
          {formatLongDate(photo.takenAt) ||
            formatLongDate(new Date().toISOString())}
        </p>
        <p className="text-neutral-800">{photo.description}</p>
      </div>
    </div>
  )
}

// ==============================
// ✅ Gallery Grid View
// ==============================
function GalleryView({ gallery }) {
  const [active, setActive] = useState(null)
  const photos = useMemo(
    () =>
      [...(gallery?.photos || [])].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      ),
    [gallery?.photos]
  )

  return (
    <div className="min-h-[100svh] bg-[#FAD7D7] px-4 py-8">
      <div className="max-w-[420px] mx-auto">
        <h1 className="text-3xl font-serif text-[#1C2440]">
          {gallery?.title || "Our Special Moments"}
        </h1>
        {gallery?.date && (
          <p className="mt-2 text-sm text-[#1C2440]">
            {formatLongDate(gallery.date)}
          </p>
        )}
        <p className="mt-3 text-[#1C2440]">
          {gallery?.description ||
            "A curated collection of photos and memories — capturing laughter, love, and the little things that matter most."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <button
              key={p.id}
              className="relative aspect-square overflow-hidden"
              onClick={() => setActive(p)}
            >
              <img
                src={p.imageUrl}
                alt={p.caption || ""}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <Lightbox photo={active} onClose={() => setActive(null)} />
    </div>
  )
}

// ==============================
// ✅ Page
// ==============================
export default function GalleryPublicPage() {
  const params = useParams()
  const id = params.id

  const [authToken, setAuthToken] = useState(null)
  const [forceGate, setForceGate] = useState(false)

  useEffect(() => {
    const t = sessionStorage.getItem(`gallery:${id}:token`)
    setAuthToken(t || null)
  }, [id])

  const { data, loading, error, refetch } = useQuery(GET_GALLERY, {
    variables: { id },
    fetchPolicy: "no-cache",
    context: authToken
      ? { headers: { Authorization: `Bearer ${authToken}` } }
      : undefined,
    onError: (e) => {
      // If backend replies unauthorized/forbidden for private galleries,
      // we’ll show the PinGate.
      if (/unauthorized|forbidden|401|403/i.test(e.message)) {
        setForceGate(true)
      }
    },
  })

  // Loading splash
  if (loading && !forceGate) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading gallery…</p>
      </main>
    )
  }

  // Private or public-with-pass required → Gate
  if (forceGate) {
    return (
      <PinGate
        galleryId={id}
        onSuccess={async (token) => {
          setAuthToken(token)
          setForceGate(false)
          await refetch({
            id,
          })
        }}
      />
    )
  }

  // Non-auth errors
  if (error && !forceGate) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading gallery: {error.message}</p>
      </main>
    )
  }

  const gallery = data?.gallery
  if (!gallery) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700">Gallery not found.</p>
      </main>
    )
  }

  // If the API exposes status and you want to gate purely by it:
  // if (gallery.status === "PRIVATE" && !authToken) return <PinGate ... />

  return <GalleryView gallery={gallery} />
}
