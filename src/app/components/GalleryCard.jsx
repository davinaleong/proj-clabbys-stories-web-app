"use client"
import Image from "next/image"

export default function GalleryCard({ images, title, date, description }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
      {/* Grid of 4 images */}
      <div className="grid grid-cols-2 grid-rows-2 gap-0 w-full h-full">
        {/* Top-left (wide) */}
        <div className="col-span-1 row-span-1 relative border">
          <Image
            src={images[0] || "/placeholder.jpg"}
            alt={`${title} photo 1`}
            fill
            className="object-cover"
          />
        </div>

        {/* Top-right (tall) */}
        <div className="col-span-1 row-span-1 relative border">
          <Image
            src={images[1] || "/placeholder.jpg"}
            alt={`${title} photo 2`}
            fill
            className="object-cover"
          />
        </div>

        {/* Bottom-left (tall) */}
        <div className="col-span-1 row-span-1 relative border">
          <Image
            src={images[2] || "/placeholder.jpg"}
            alt={`${title} photo 3`}
            fill
            className="object-cover"
          />
        </div>

        {/* Bottom-right (wide) */}
        <div className="col-span-1 row-span-1 relative border">
          <Image
            src={images[3] || "/placeholder.jpg"}
            alt={`${title} photo 4`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* White translucent overlay for title/description */}
      <div className="absolute inset-0 bg-white/60 flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-lg font-semibold text-carbon-blue-700">{title}</h2>
        <p className="text-sm text-gray-700">{date}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}
