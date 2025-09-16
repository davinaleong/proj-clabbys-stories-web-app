// GalleryView.jsx
"use client"

import { useMemo, useState, useEffect } from "react"
import { formatByEnum } from "./../lib/format-by-enum"
import Lightbox from "./../components/Lightbox"
import Slideshow from "./../components/Slideshow"

function normalizePhoto(p) {
  const title = (p?.title ?? "").toString().trim()
  const description = (p?.description ?? "").toString().trim()
  const takenAt = p?.takenAt ?? null
  return { ...p, title, description, takenAt }
}

export default function GalleryView({ gallery, formatDateEnum }) {
  const [active, setActive] = useState(null) // for Lightbox
  const [showSlideshow, setShowSlideshow] = useState(false) // for Slideshow

  const photos = useMemo(() => {
    const sorted = [...(gallery?.photos || [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )
    return sorted.map(normalizePhoto)
  }, [gallery?.photos])

  // auto-start slideshow if gallery is in slideshow mode
  useEffect(() => {
    if (gallery?.lightboxMode === "SLIDESHOW" && photos.length > 0) {
      setShowSlideshow(true)
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

        {/* ✅ Grid of thumbnails (still visible even if slideshow exists) */}
        <div className="mt-4 flex flex-wrap gap-4">
          {photos.map((p) => (
            <button
              key={p.id}
              className="relative max-w-[150px] rounded-sm shadow-lg aspect-square overflow-hidden"
              onClick={() => setActive(p)} // opens Lightbox
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

      {/* 🖼 Manual Lightbox (only if a photo is clicked) */}
      {active && (
        <Lightbox
          photo={active}
          photos={photos}
          formatDateEnum={formatDateEnum}
          onClose={() => setActive(null)}
        />
      )}

      {/* 🎞 Auto Slideshow (if mode = SLIDESHOW) */}
      {showSlideshow && (
        <Slideshow
          gallery={gallery}
          photos={photos}
          intervalMs={7000}
          formatDateEnum={formatDateEnum}
          onClose={() => setShowSlideshow(false)} // exit slideshow
        />
      )}
    </div>
  )
}
