"use client"
import { useState } from "react"
import Image from "next/image"

export default function GalleriesPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Sample gallery data
  const galleries = Array(9).fill({
    title: "Our Special Moments",
    date: "Saturday, 5 July 2025",
    description:
      "A curated collection of photos and memories — capturing laughter, love, and the little things that matter most.",
    image: "/sample.jpg", // replace with real gallery cover image
  })

  return (
    <div className="min-h-screen bg-pastel-pink-500 flex flex-col">
      {/* Navbar */}
      <header className="bg-carbon-blue-500 text-white w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" />
          </svg>
          <span className="font-semibold text-lg">App Name</span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          <a href="#" className="hover:underline">
            Galleries
          </a>
          <a href="#">Photos</a>
          <a href="#">Settings</a>
          <a href="#">FAQ</a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1"
        >
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="bg-[#1c1c4a] text-white flex flex-col md:hidden">
          <a href="#" className="py-2 px-6 hover:bg-[#242448]">
            Galleries
          </a>
          <a href="#" className="py-2 px-6 hover:bg-[#242448]">
            Photos
          </a>
          <a href="#" className="py-2 px-6 hover:bg-[#242448]">
            Settings
          </a>
          <a href="#" className="py-2 px-6 hover:bg-[#242448]">
            FAQ
          </a>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        {/* Title + Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#1c1c4a]">Galleries</h1>
          <button className="bg-[#1c1c4a] text-white px-4 py-2 rounded-md hover:bg-[#242448]">
            Add
          </button>
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
    </div>
  )
}
