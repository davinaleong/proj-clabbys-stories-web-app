"use client"
import { useParams } from "next/navigation"
import { gql, useQuery } from "@apollo/client"
import Image from "next/image"
import { formatDate } from "../../../utils/format-date"
import placeholderImage from "./../../assets/images/placeholder-cbs.png"
import checkIcon from "./../../assets/icons/check.svg"

// ✅ GraphQL query for single gallery
const GET_GALLERY = gql`
  query GetGallery($id: ID!) {
    gallery(id: $id) {
      id
      title
      description
      date
      createdAt
      photos {
        id
        imageUrl
        caption
        takenAt
      }
    }
  }
`

export default function GalleryPage() {
  const params = useParams()
  const galleryId = params.id

  const { data, loading, error } = useQuery(GET_GALLERY, {
    variables: { id: galleryId },
  })

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading gallery...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading gallery: {error.message}</p>
      </main>
    )
  }

  const gallery = data?.gallery || {
    title: "Untitled Gallery",
    description: "No description provided.",
    date: null,
    photos: [],
  }

  const galleryDate = formatDate(
    gallery.date || gallery.createdAt,
    "EEEE_DD_MMM_YYYY"
  )

  const photos = gallery.photos?.length
    ? gallery.photos
    : Array(8).fill({ id: "placeholder", imageUrl: placeholderImage })

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flow">
      {/* ✅ Title + Add Button */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-bold text-carbon-blue-700">
          {gallery.title}
        </h1>
        <button
          type="button"
          className="flex gap-2 cursor-pointer items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-500"
        >
          <Image src={checkIcon} alt="Check Icon" width={16} height={16} /> Save
        </button>
      </header>

      {/* Gallery Info */}
      <section className="mb-6 flow">
        <p className="text-gray-800 mb-1">{gallery.description}</p>
        <p className="text-sm text-gray-700 mb-4">{galleryDate}</p>

        {/* Passphrase Input */}
        <label className="block text-sm text-gray-700 font-medium mb-1">
          Passphrase
        </label>
        <input
          type="password"
          placeholder="Enter gallery passphrase"
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-carbon-blue-200"
        />

        {/* Photo Grid */}
        <div>
          <h2 className="text-lg font-semibold text-carbon-blue-700 mb-4 sr-only">
            Photos
          </h2>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <div
                key={photo.id || i}
                className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden"
              >
                <Image
                  src={photo.imageUrl || placeholderImage}
                  alt={photo.caption || `Photo ${i + 1}`}
                  fill
                  className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
