"use client"
import { gql, useQuery } from "@apollo/client"
import Image from "next/image"
import Link from "next/link"

// ✅ Utilities
import { formatDate } from "../../utils/format-date"

// ✅ GalleryCard
import GalleryCard from "./../components/GalleryCard"

// ✅ Icons
import plusIcon from "./../assets/icons/plus.svg"

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

export default function EditorPage() {
  const { data, loading, error } = useQuery(GET_ALL_GALLERIES, {
    fetchPolicy: "no-cache",
  })

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
        <Link
          href="#"
          className="flex gap-2 items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-800"
        >
          <Image src={plusIcon} alt="Plus Icon" width={16} height={16} /> Add
        </Link>
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
