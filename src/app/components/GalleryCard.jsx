"use client"
import Image from "next/image"
import Link from "next/link"
import { formatDate } from "../../utils/format-date"

import imagePlaceholder from "./../assets/images/placeholder-cbs.png"

export default function GalleryCard({
  title,
  date,
  description,
  status,
  images = [],
  href = "#",
}) {
  const formattedDate = formatDate(date)

  // ✅ If no images provided, fallback to default placeholders
  const fallbackImages = [
    imagePlaceholder,
    imagePlaceholder,
    imagePlaceholder,
    imagePlaceholder,
  ]
  const displayImages = images && images.length > 0 ? images : fallbackImages

  return (
    <Link
      href={href}
      className="relative w-full aspect-[4/3] border-4 border-white bg-white overflow-hidden"
    >
      {/* Grid of 4 images */}
      <div className="grid grid-cols-2 grid-rows-2 gap-0 w-full h-full">
        {displayImages.map((img, index) => (
          <div
            key={index}
            className="col-span-1 row-span-1 relative border border-white"
          >
            <Image
              src={img}
              alt={`${title} photo ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* White translucent overlay for title/description */}
      <div className="absolute inset-0 bg-white/70 flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-2xl font-serif font-bold text-carbon-blue-700">
          {title}{" "}
          <small className="text-sm font-normal font-sans">({status})</small>
        </h2>
        <p className="text-sm italic text-gray-700">{formattedDate}</p>
        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  )
}
