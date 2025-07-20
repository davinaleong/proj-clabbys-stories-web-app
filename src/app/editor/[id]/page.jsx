"use client"
import { useParams } from "next/navigation"
import { gql, useQuery } from "@apollo/client"
import Image from "next/image"
import { useState, useEffect } from "react"
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

  // ✅ Always define states first
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedDate, setEditedDate] = useState("")
  const [actualPassphrase, setActualPassphrase] = useState("")
  const maskedPassphrase = actualPassphrase.replace(/./g, "*")

  useEffect(() => {
    if (data?.gallery) {
      const g = data.gallery
      setEditedTitle(g.title || "Untitled Gallery")
      setEditedDescription(g.description || "No description provided.")
      setEditedDate(
        g.date
          ? formatDate(g.date, "EEEE_DD_MMM_YYYY")
          : formatDate(g.createdAt, "EEEE_DD_MMM_YYYY")
      )
      setActualPassphrase("") // Initially blank until user edits
    }
  }, [data])

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

  const gallery = data?.gallery || { photos: [] }
  const photos = gallery.photos?.length
    ? gallery.photos
    : Array(8).fill({ id: "placeholder", imageUrl: placeholderImage })

  const handleSave = () => {
    console.log("Saving edits:", {
      title: editedTitle,
      description: editedDescription,
      date: editedDate,
      passphrase: actualPassphrase,
    })
    // ✅ TODO: Call updateGallery mutation here
  }

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flow">
      {/* ✅ Title + Save Button */}
      <header className="flex justify-between items-center">
        <h1
          className="font-serif text-3xl font-bold text-carbon-blue-700 outline-none"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => setEditedTitle(e.currentTarget.textContent)}
        >
          {editedTitle}
        </h1>

        <button
          type="button"
          className="flex gap-2 cursor-pointer items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-500"
          onClick={handleSave}
        >
          <Image src={checkIcon} alt="Check Icon" width={16} height={16} /> Save
        </button>
      </header>

      {/* ✅ Gallery Info Section */}
      <section className="mb-6 space-y-2">
        {/* Editable Description */}
        <p
          className="text-gray-800 outline-none"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => setEditedDescription(e.currentTarget.textContent)}
        >
          {editedDescription}
        </p>

        {/* Editable Date */}
        <p
          className="text-gray-700 outline-none"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => setEditedDate(e.currentTarget.textContent)}
        >
          {editedDate}
        </p>

        {/* Editable Passphrase (same style as description/date, masked) */}
        <p
          className="text-gray-700 outline-none"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onFocus={(e) => {
            // Show masked when focused
            e.currentTarget.textContent = maskedPassphrase
          }}
          onInput={(e) => {
            const text = e.currentTarget.textContent || ""
            // Detect added characters
            if (text.length > maskedPassphrase.length) {
              const newChar = text.slice(-1)
              setActualPassphrase((prev) => prev + newChar)
            } else if (text.length < maskedPassphrase.length) {
              // handle backspace
              setActualPassphrase((prev) => prev.slice(0, -1))
            }
            // Mask immediately
            e.currentTarget.textContent = actualPassphrase.replace(/./g, "*")
            // Move caret to the end
            const range = document.createRange()
            const sel = window.getSelection()
            range.selectNodeContents(e.currentTarget)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
          }}
          onBlur={(e) => {
            // Always keep masked on blur
            e.currentTarget.textContent = maskedPassphrase || "Enter passphrase"
          }}
        >
          {maskedPassphrase || "Enter passphrase"}
        </p>
      </section>

      {/* ✅ Photos Section */}
      <section>
        <h2 className="text-lg font-semibold text-carbon-blue-700 mb-4 sr-only">
          Photos
        </h2>
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
      </section>
    </main>
  )
}
