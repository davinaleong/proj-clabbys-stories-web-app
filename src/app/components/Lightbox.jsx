"use client"
import { useEffect, useState } from "react"
import { formatByEnum } from "./../lib/format-by-enum"
import Image from "next/image"
import iconX from "./../assets/icons/x-w.svg"

export default function Lightbox({
  photo,
  onClose,
  photos = [],
  slideshow = false,
  intervalMs = 7000,
  formatDateEnum,
}) {
  const [activeIndex, setActiveIndex] = useState(
    photo ? photos.findIndex((p) => p.id === photo.id) : 0
  )
  const [fade, setFade] = useState(true)

  useEffect(() => {
    if (!slideshow || photos.length === 0) return

    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % photos.length)
        setFade(true)
      }, 400)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [slideshow, photos.length, intervalMs])

  const current = photos[activeIndex]
  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🖼 Image with fade */}
        <img
          key={current.id}
          src={current.imageUrl}
          alt={current.title || ""}
          className={`w-full max-h-[80vh] object-contain transition-opacity duration-500 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* 📝 Metadata */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
          {current.title && (
            <h2 className="text-xl font-bold">{current.title}</h2>
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

        {/* ❌ Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 px-3 py-1 rounded-md"
        >
          <Image src={iconX} alt="Close" width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
