"use client"
import { useParams } from "next/navigation"
import { gql, useQuery } from "@apollo/client"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

import SortablePhoto from "../../components/SortablePhoto"
import placeholderImage from "./../../assets/images/placeholder-cbs.png"
import checkIcon from "./../../assets/icons/check.svg"
import { formatDate } from "../../../utils/format-date"

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

  // ✅ Always call hooks in the same order
  const [photos, setPhotos] = useState([])

  // ✅ Extract gallery safely
  const gallery = data?.gallery || null

  // ✅ When data changes, update photos
  useEffect(() => {
    if (gallery?.photos?.length) {
      setPhotos(gallery.photos)
    } else {
      setPhotos(
        Array(8).fill({ id: crypto.randomUUID(), imageUrl: placeholderImage })
      )
    }
  }, [gallery])

  // ✅ Sensors for drag & drop (safe to define here)
  const sensors = useSensors(useSensor(PointerSensor))

  // ✅ Handle drag reorder
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPhotos((prevPhotos) => {
      const oldIndex = prevPhotos.findIndex((p) => p.id === active.id)
      const newIndex = prevPhotos.findIndex((p) => p.id === over.id)
      return arrayMove(prevPhotos, oldIndex, newIndex)
    })
  }

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

  const galleryDate = gallery
    ? formatDate(gallery.date || gallery.createdAt, "EEEE_DD_MMM_YYYY")
    : ""

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{gallery?.title || "Untitled"}</h1>
      </header>

      <p className="mb-2 text-gray-700">
        {gallery?.description || "No description"}
      </p>
      <p className="text-sm text-gray-500 mb-4">{galleryDate}</p>

      {/* ✅ Drag & Drop Photo Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <SortablePhoto key={photo.id} photo={photo} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  )
}
