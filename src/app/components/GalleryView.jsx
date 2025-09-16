"use client"

import { useMemo, useState, useEffect } from "react"
import { formatByEnum } from "./../lib/format-by-enum"
import Lightbox from "./../components/Lightbox"

function normalizePhoto(p) {
  const title = (p?.title ?? "").toString().trim()
  const description = (p?.description ?? "").toString().trim()
  const takenAt = p?.takenAt ?? null // raw; Lightbox formats it
  return { ...p, title, description, takenAt }
}

export default function GalleryView({ gallery, formatDateEnum }) {
  console.log("Gallery", gallery)
  const [active, setActive] = useState(null)

  const photos = useMemo(() => {
    const sorted = [...(gallery?.photos || [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )
    return sorted.map(normalizePhoto)
  }, [gallery?.photos])

  useEffect(() => {
    if (gallery?.lightboxMode === "SLIDESHOW" && photos.length > 0) {
      setActive(null) // start with the first photo
    }
  }, [gallery?.lightboxMode, photos])

  return (
    <div className="min-h-[100svh] bg-pastel-pink-500 px-4 py-8">
      <div className="mx-auto max-w-lg">
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

        <div className="mt-4 flex flex-wrap gap-4">
          {photos.map((p) => (
            <button
              key={p.id}
              className="relative max-w-[150px] rounded-sm shadow-lg aspect-square overflow-hidden"
              onClick={() => setActive(p)} // pass normalized photo w/ metadata
            >
              <img
                src={p.imageUrl}
                alt={p.description || p.title || ""}
                className="block h-full w-full aspect-square object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* key ensures fresh mount when switching images (optional but nice) */}
      <Lightbox
        key={active?.id || "slideshow"}
        photo={active}
        onClose={() => setActive(null)}
        photos={photos}
        slideshow={gallery?.lightboxMode === "SLIDESHOW"}
        intervalMs={7000}
        formatDateEnum={formatDateEnum}
      />
    </div>
  )
}
