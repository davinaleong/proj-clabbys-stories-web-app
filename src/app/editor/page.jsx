import Image from "next/image"
import Link from "next/link"

import plusIcon from "./../assets/icons/plus.svg"

export default function EditorPage() {
  // Sample gallery data
  const galleries = Array(9).fill({
    title: "Our Special Moments",
    date: "Saturday, 5 July 2025",
    description:
      "A curated collection of photos and memories — capturing laughter, love, and the little things that matter most.",
    image: "/sample.jpg", // replace with real gallery cover image
  })

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
      {/* Title + Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-carbon-blue-700">
          Galleries
        </h1>
        <Link
          href="#"
          className="flex gap-2 items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-700"
        >
          <Image src={plusIcon} alt="Grid Icon" width={16} height={16} /> Add
        </Link>
      </div>

      {/* Galleries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery, i) => (
          <div
            key={i}
            className="bg-white shadow-sm border border-[#f5d5d6] rounded-md overflow-hidden"
          >
            {/* Gallery Cover */}
            <div className="relative h-48 w-full">
              <Image
                src={gallery.image}
                alt={gallery.title}
                fill
                className="object-cover opacity-80"
              />
            </div>

            {/* Gallery Text */}
            <div className="p-4 text-center">
              <h2 className="font-semibold text-lg">{gallery.title}</h2>
              <p className="text-sm text-gray-700 mt-1">{gallery.date}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {gallery.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
