"use client"

import { useMemo, useState } from "react"
import { formatByEnum } from "./../lib/format-by-enum"
import Lightbox from "./../components/Lightbox"

function normalizePhoto(p) {
  const title = (p?.title ?? p?.caption ?? "").toString().trim()
  const description = (p?.description ?? p?.caption ?? "").toString().trim()
  const takenAt = p?.takenAt ?? null // raw; Lightbox formats it
  return { ...p, title, description, takenAt }
}

export default function GalleryView({ gallery, formatDateEnum, overlayMode }) {
  const [active, setActive] = useState(null)

  const photos = useMemo(() => {
    const sorted = [...(gallery?.photos || [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )
    return sorted.map(normalizePhoto)
  }, [gallery?.photos])

  return (
    <div className="min-h-[100svh] bg-[#FAD7D7] px-4 py-8">
      <div className="max-w-[420px] mx-auto">
        <h1 className="text-3xl font-serif font-bold text-carbon-blue-500">
          {gallery?.title || "Our Special Moments"}
        </h1>

        {gallery?.date && (
          <p className="mt-2 text-sm text-carbon-blue-500">
            {formatByEnum(gallery.date, formatDateEnum || undefined)}
          </p>
        )}

        <p className="mt-3 text-carbon-blue-500">
          {gallery?.description ||
            "A curated collection of photos and memories — capturing laughter, love, and the little things that matter most."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <button
              key={p.id}
              className="relative aspect-square overflow-hidden"
              onClick={() => setActive(p)} // pass normalized photo w/ metadata
            >
              <img
                src={p.imageUrl}
                alt={p.description || p.title || ""}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* key ensures fresh mount when switching images (optional but nice) */}
      <Lightbox
        key={active?.id || "none"}
        photo={active}
        onClose={() => setActive(null)}
        overlayMode={overlayMode}
      />
    </div>
  )
}
