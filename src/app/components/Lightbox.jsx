// Lightbox.jsx
"use client"

import Image from "next/image"
import { formatByEnum } from "./../lib/format-by-enum"
import iconX from "./../assets/icons/x-w.svg"

export default function Lightbox({
  photo,
  photos = [],
  onClose,
  formatDateEnum,
}) {
  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose} // click outside closes
    >
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* 🖼 Main Image */}
        <img
          src={photo.imageUrl}
          alt={photo.title || ""}
          className="w-full max-h-[80vh] object-contain"
        />

        {/* 📝 Metadata */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
          {photo.title && <h2 className="text-xl font-bold">{photo.title}</h2>}
          {photo.description && (
            <p className="mt-1 text-sm opacity-90">{photo.description}</p>
          )}
          {photo.takenAt && (
            <p className="mt-1 text-xs opacity-70">
              {formatByEnum(photo.takenAt, formatDateEnum)}
            </p>
          )}
        </div>

        {/* ❌ Close button */}
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
