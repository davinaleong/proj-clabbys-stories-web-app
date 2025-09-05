// ─────────────────────────────────────────────────────────────────────────────
// file: components/Lightbox.jsx
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import { useEffect } from "react"

export default function Lightbox({ photo, onClose, overlayMode }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.()
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [onClose])

  if (!photo) return null

  const overlayClass =
    overlayMode === "BLURRED"
      ? "fixed inset-0 z-50 bg-black/40 backdrop-blur"
      : "fixed inset-0 z-50 bg-black/90"

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
      </div>
    </div>
  )
}
