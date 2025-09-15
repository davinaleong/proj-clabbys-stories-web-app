"use client"

import { useEffect } from "react"
import { formatByEnum } from "./../lib/format-by-enum"

// Safe parser that accepts ISO string or epoch-ish values.
// Returns Date or null.
function parseDateish(dateish) {
  if (!dateish && dateish !== 0) return null
  const v = Number.isFinite(+dateish) ? Number(dateish) : dateish
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export default function Lightbox({ photo, onClose, overlayMode }) {
  console.log(photo) // null, TODO: Debug
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

  // ── Metadata preparation
  const title = (photo.title || "").trim()
  const description = (photo.description || "").trim() // fixed the 'descrption' typo
  const takenAtDate = parseDateish(photo.takenAt)
  const takenAtLabel = takenAtDate
    ? formatByEnum(takenAtDate.getTime(), "EEEE_D_MMM_YYYY")
    : ""

  // Show the overlay only if at least one field exists
  const hasMeta = Boolean(title || description || takenAtLabel)

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
          alt={title || "Photo"}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {hasMeta && (
        <div className="absolute left-0 right-0 bottom-0 mx-4 mb-6 bg-white/70 rounded-sm p-4 max-w-[680px] shadow-lg">
          {title && (
            <h3 className="text-2xl font-bold font-serif text-carbon-blue-500 mb-1">
              {title}
            </h3>
          )}

          {description && <p className="text-gray-800">{description}</p>}

          {takenAtLabel && (
            <div className="text-sm text-gray-600 mt-2">
              Taken At: <span className="font-medium">{takenAtLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
