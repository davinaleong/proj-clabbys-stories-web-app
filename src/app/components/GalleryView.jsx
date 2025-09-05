// ─────────────────────────────────────────────────────────────────────────────
// file: components/GalleryView.jsx
// ─────────────────────────────────────────────────────────────────────────────
"use client"

import { useMemo, useState } from "react"
import { formatByEnum } from "./../lib/format-by-enum"
import Lightbox from "./../components/Lightbox"

export default function GalleryView({ gallery, formatDateEnum, overlayMode }) {
  const [active, setActive] = useState(null)

  const photos = useMemo(() => {
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
            {formatByEnum(gallery.date, formatDateEnum || undefined)}
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

      <Lightbox
        photo={active}
        onClose={() => setActive(null)}
        overlayMode={overlayMode}
      />
    </div>
  )
}
