"use client"

import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useEffect, useMemo, useState } from "react"
import { env } from "../lib/env"
import Image from "next/image"
import logo from "../assets/logos/logo-midnight.png"

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

const VERIFY_GALLERY_PIN = gql`
  mutation VerifyGalleryPin($id: ID!, $pin: String!) {
    verifyGalleryPin(id: $id, pin: $pin) {
      ok
      token
      message
    }
  }
`

// ✅ App settings (same as your layout)
const GET_APP_SETTING_BY_ID = gql`
  query GetAppSetting($id: ID!) {
    appSetting(id: $id) {
      id
      applicationName
      lightboxMode
      defaultSortOrder
      defaultDateFormat
    }
  }
`

// ==============================
// ✅ Date formatting with fallback + enum support
// ==============================
function formatByEnum(dateish, fmtEnum) {
  const d = Number.isFinite(+dateish)
    ? new Date(Number(dateish))
    : new Date(dateish)
  if (!fmtEnum) {
    // fallback long
    return new Intl.DateTimeFormat("en-SG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d)
  }

  // map a few enum styles you’re using in your schema
  switch (fmtEnum) {
    case "EEEE_D_MMM_YYYY": // Sunday, 20 Jul 2025
      return new Intl.DateTimeFormat("en-SG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d)
    case "EEE_D_MMM_YYYY": // Sun, 20 Jul 2025
      return new Intl.DateTimeFormat("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d)
    case "D_MMM_YYYY": // 20 Jul 2025
      return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d)
    case "D_MMMM_YYYY": // 20 July 2025
      return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
    default:
      // unknown enum -> fallback
      return new Intl.DateTimeFormat("en-SG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
  }
}

// ==============================
// ✅ Pin Gate (uses appName from settings)
// ==============================
function PinGate({ galleryId, onSuccess, appName }) {
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
// ✅ Lightbox (overlay style comes from settings.lightboxMode)
// ==============================
function Lightbox({ photo, onClose, overlayMode }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [onClose])

  if (!photo) return null

  const overlayClass =
    overlayMode === "BLURRED"
      ? "fixed inset-0 z-50 bg-black/40 backdrop-blur"
      : "fixed inset-0 z-50 bg-black/90" // BLACK default

  return (
    <div className={overlayClass}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 text-white text-3xl"
      >
        ×
      </button>

      <div className="h-full w-full flex items-center justify-center px-4">
        <img
          src={photo.imageUrl}
          alt={photo.caption || ""}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="absolute left-0 right-0 bottom-0 mx-4 mb-6 bg-white p-4 max-w-[680px]">
        <h3 className="text-xl font-semibold mb-1">
          {photo.caption || "Photo Title"}
        </h3>
        {/* Date formatting moved to parent (we pass a formatter) */}
      </div>
    </div>
  )
}

// ==============================
// ✅ Gallery Grid View
// ==============================
function GalleryView({ gallery, formatDateEnum, overlayMode }) {
  const [active, setActive] = useState(null)

  const photos = useMemo(() => {
    // Keep your explicit position order by default
    return [...(gallery?.photos || [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )
  }, [gallery?.photos])

  return (
    <div className="min-h-[100svh] bg-[#FAD7D7] px-4 py-8">
      <div className="max-w-[420px] mx-auto">
        <h1 className="text-3xl font-serif text-[#1C2440]">
          {gallery?.title || "Our Special Moments"}
        </h1>

        {gallery?.date && (
          <p className="mt-2 text-sm text-[#1C2440]">
            {formatByEnum(gallery.date, formatDateEnum)}
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

      {/* Pass settings-driven overlay + date formatting */}
      <Lightbox
        photo={active}
        onClose={() => setActive(null)}
        overlayMode={overlayMode}
      />
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

  // 🔹 Fetch app settings
  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
  } = useQuery(GET_APP_SETTING_BY_ID, {
    variables: { id: env.APP_SETTINGS_UUID },
    fetchPolicy: "network-only",
  })

  const appSetting = settingsData?.appSetting
  const appName = appSetting?.applicationName || "Clabby's Stories"
  const overlayMode = appSetting?.lightboxMode || "BLACK"
  const defaultDateFormat = appSetting?.defaultDateFormat || null

  // Save settings locally once loaded (same behavior as layout)
  useEffect(() => {
    if (appSetting) {
      localStorage.setItem("appSettings", JSON.stringify(appSetting))
    }
  }, [appSetting])

  // pull any existing token
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
      if (/unauthorized|forbidden|401|403/i.test(e.message)) setForceGate(true)
    },
  })

  // If settings failed, just log like layout
  useEffect(() => {
    if (settingsError) {
      console.warn("⚠️ Failed to fetch settings:", settingsError.message)
    }
  }, [settingsError])

  // Loading splash (prefer to show gallery loading first; settings can trail)
  if (loading && !forceGate) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading gallery…</p>
      </main>
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

  // In your app, "PUBLISHED" means **gated**
  if ((forceGate || gallery?.status === "PUBLISHED") && !authToken) {
    return (
      <PinGate
        galleryId={id}
        appName={settingsLoading ? "Loading…" : appName}
        onSuccess={async (token) => {
          setAuthToken(token)
          setForceGate(false)
          await refetch()
        }}
      />
    )
  }

  if (!gallery) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700">Gallery not found.</p>
      </main>
    )
  }

  return (
    <GalleryView
      gallery={gallery}
      formatDateEnum={defaultDateFormat}
      overlayMode={overlayMode}
    />
  )
}
