// ─────────────────────────────────────────────────────────────────────────────
// file: app/galleries/[id]/page.jsx
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, gql } from "@apollo/client"
import { env } from "./../../lib/env"
import PinGate from "./../../components/PinGate"
import GalleryView from "./../../components/GalleryView"
import { useAuthToken } from "./../../hooks/use-auth-token"

// ✅ Queries & Mutations kept here
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

export default function GalleryPublicPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? ""

  const { token, saveToken } = useAuthToken(id)
  const [forceGate, setForceGate] = useState(false)

  // Fetch app settings
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

  useEffect(() => {
    if (appSetting)
      localStorage.setItem("appSettings", JSON.stringify(appSetting))
  }, [appSetting])

  const { data, loading, error, refetch } = useQuery(GET_GALLERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: "no-cache",
    context: token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
    onError: (e) => {
      if (/unauthorized|forbidden|401|403/i.test(e.message)) setForceGate(true)
    },
  })

  useEffect(() => {
    if (settingsError)
      console.warn("⚠️ Failed to fetch settings:", settingsError.message)
  }, [settingsError])

  if ((loading || !id) && !forceGate) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading gallery…</p>
      </main>
    )
  }

  if (error && !forceGate) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading gallery: {error.message}</p>
      </main>
    )
  }

  const gallery = data?.gallery

  if ((forceGate || gallery?.status === "PUBLISHED") && !token) {
    return (
      <PinGate
        galleryId={id}
        appName={settingsLoading ? "Loading…" : appName}
        VERIFY_GALLERY_PIN={VERIFY_GALLERY_PIN}
        onSuccess={async (newToken) => {
          saveToken(newToken)
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
