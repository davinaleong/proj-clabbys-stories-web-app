"use client"
import Image from "next/image"
import Link from "next/link"

// ✅ Import the new GalleryCard
import GalleryCard from "./../components/GalleryCard"

// Icons
import plusIcon from "./../assets/icons/plus.svg"

export default function EditorPage() {
  // ✅ Sample data
  const galleries = Array(6).fill({
    title: "Our Special Moments",
    date: "Saturday, 5 July 2025",
    description:
      "A curated collection of photos and memories — capturing laughter, love, and the little things that matter most.",
  })

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
      {/* Title + Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-bold text-carbon-blue-700">
          Galleries
        </h1>
        <Link
          href="#"
          className="flex gap-2 items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-700"
        >
          <Image src={plusIcon} alt="Add Gallery" width={16} height={16} /> Add
        </Link>
      </div>

      {/* ✅ Now use GalleryCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery, i) => (
          <GalleryCard
            key={i}
            images={gallery.images}
            title={gallery.title}
            date={gallery.date}
            description={gallery.description}
          />
        ))}
      </div>
    </main>
  )
}
