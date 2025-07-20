"use client"
import Image from "next/image"
import Link from "next/link"

import image0001 from "./../assets/images/0001.jpg"
import image0002 from "./../assets/images/0002.jpg"
import image0003 from "./../assets/images/0003.jpg"
import image0004 from "./../assets/images/0004.jpg"

export default function GalleryCard({
  title,
  date,
  description,
  images = [],
  url = "#",
}) {
  // ✅ If no images provided, fallback to default placeholders
  const fallbackImages = [image0001, image0002, image0003, image0004]
  const displayImages = images && images.length > 0 ? images : fallbackImages

  return (
    <Link
      href={url}
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
        <h2 className="text-2xl font-serif font-semibold text-carbon-blue-700">
          {title}
        </h2>
        <p className="text-sm text-gray-700">{date}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  )
}
