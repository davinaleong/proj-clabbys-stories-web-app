// ─────────────────────────────────────────────────────────────────────────────
// file: useAuthToken.js
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import { useEffect, useState } from "react"

export function useAuthToken(galleryId) {
  const [token, setToken] = useState(null)

  useEffect(() => {
    if (!galleryId) return
    const t = sessionStorage.getItem(`gallery:${galleryId}:token`)
    setToken(t || null)
  }, [galleryId])

  function saveToken(newToken) {
    if (!galleryId || !newToken) return
    sessionStorage.setItem(`gallery:${galleryId}:token`, newToken)
    setToken(newToken)
  }

  function clearToken() {
    if (!galleryId) return
    sessionStorage.removeItem(`gallery:${galleryId}:token`)
    setToken(null)
  }

  return { token, saveToken, clearToken }
}
