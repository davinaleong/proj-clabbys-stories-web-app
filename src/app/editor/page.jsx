"use client"
import { gql, useQuery } from "@apollo/client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

// ✅ Utilities
import { formatDate } from "../utils/format-date"

// ✅ GalleryCard
import GalleryCard from "./../components/GalleryCard"

// ✅ Icons
import plusIcon from "./../assets/icons/plus.svg"
import iconLoaderWhite from "./../assets/icons/loader-circle-w.svg"

// ✅ Fetch ALL galleries with photos + status
const GET_ALL_GALLERIES = gql`
  query GetGalleries {
    galleries {
      __typename
      id
      title
      description
      date
      createdAt
      status
      photos {
        __typename
        id
        imageUrl
      }
    }
  }
`

export default function HomePage() {
  const { data, loading, error } = useQuery(GET_ALL_GALLERIES, {
    fetchPolicy: "no-cache",
  })

  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleCreateClick = () => {
    setCreating(true)
    // Simulate a tiny delay before navigation (to show spinner briefly)
    setTimeout(() => {
      router.push("/editor/create")
    }, 200)
  }

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading galleries...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading galleries: {error.message}</p>
      </main>
    )
  }

  const galleries = data?.galleries || []

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
      {/* ✅ Title + Add Button */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-bold text-carbon-blue-700">
          Galleries
        </h1>

        <button
          onClick={handleCreateClick}
          disabled={creating}
          className={`flex gap-2 items-center px-4 py-2 rounded-md transition ${
            creating
              ? "bg-carbon-blue-500 opacity-80 cursor-not-allowed"
              : "bg-carbon-blue-700 hover:bg-carbon-blue-800 text-white"
          }`}
        >
          {creating ? (
            <>
              <Image
                src={iconLoaderWhite}
                alt="Loading..."
                width={18}
                height={18}
                className="animate-spin"
              />
              Creating...
            </>
          ) : (
            <>
              <Image src={plusIcon} alt="Plus Icon" width={16} height={16} />{" "}
              Create
            </>
          )}
        </button>
      </header>

      {/* ✅ Galleries Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => {
          const previewImages =
            gallery.photos?.slice(0, 4).map((p) => p.imageUrl) || []

          // ✅ Prefer gallery.date, fallback to createdAt
          const rawDate = gallery.date || gallery.createdAt
          const formattedDate = rawDate
            ? formatDate(rawDate, "EEE_DD_MMM_YYYY")
            : "No date set"

          return (
            <GalleryCard
              key={gallery.id}
              images={previewImages}
              title={gallery.title}
              status={gallery.status}
              date={formattedDate}
              description={gallery.description || "No description provided."}
              href={`/editor/${gallery.id}`}
            />
          )
        })}
      </section>
    </main>
  )
}
