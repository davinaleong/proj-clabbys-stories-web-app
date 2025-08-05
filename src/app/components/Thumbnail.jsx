"use client"
import Image from "next/image"
import placeholderImage from "./../assets/images/placeholder-cbs.png"

export default function Thumbnail({ photo }) {
  return (
    <div className="relative aspect-[1/1] bg-gray-100 rounded overflow-hidden shadow-lg">
      <Image
        src={photo.imageUrl || placeholderImage}
        alt={photo.caption || "Photo"}
        fill
        className="object-cover"
      />
    </div>
  )
}
