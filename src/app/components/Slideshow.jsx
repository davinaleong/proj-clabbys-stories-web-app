// Slideshow.jsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { formatByEnum } from "./../lib/format-by-enum"
import iconChevronUp from "./../assets/icons/chevron-up.svg"
import iconChevronDown from "./../assets/icons/chevron-down.svg"

export default function Slideshow({
  gallery,
  photos = [],
  intervalMs = 7000,
  formatDateEnum,
}) {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [showMeta, setShowMeta] = useState(true) // collapsible toggle

  useEffect(() => {
    if (photos.length === 0) return

    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % photos.length)
        setFade(true)
      }, 400) // match CSS fade duration
    }, intervalMs)

    return () => clearInterval(timer)
  }, [photos, intervalMs])

  const current = photos[index]
  if (!current) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white">
      {/* 🔽 Collapsible Gallery Metadata */}
      <div className="w-full bg-black/70 p-4">
        <button
          onClick={() => setShowMeta((prev) => !prev)}
          className="mb-2 flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
        >
          {showMeta ? (
            <>
              <span>Hide Info</span>
              <Image src={iconChevronUp} alt="Hide" width={16} height={16} />
            </>
          ) : (
            <>
              <span>Show Info</span>
              <Image src={iconChevronDown} alt="Show" width={16} height={16} />
            </>
          )}
        </button>

        {showMeta && (
          <div>
            <h1 className="text-4xl font-serif font-bold">{gallery?.title}</h1>
            {gallery?.date && (
              <p className="text-xs opacity-70">
                {formatByEnum(gallery.date, formatDateEnum)}
              </p>
            )}
            {gallery?.description && (
              <p className="mt-1 text-sm opacity-90">{gallery.description}</p>
            )}
          </div>
        )}
      </div>

      {/* 🖼 Slideshow Image */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative max-w-4xl w-full">
          <img
            src={current.imageUrl}
            alt={current.title || ""}
            className={`w-full max-h-[80vh] object-contain transition-opacity duration-500 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* 📝 Photo Metadata */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
            {current.title && (
              <h2 className="text-2xl font-serif font-bold">{current.title}</h2>
            )}
            {current.description && (
              <p className="mt-1 text-sm opacity-90">{current.description}</p>
            )}
            {current.takenAt && (
              <p className="mt-1 text-xs opacity-70">
                {formatByEnum(current.takenAt, formatDateEnum)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
