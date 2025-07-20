"use client"
import { useParams } from "next/navigation"
import { gql, useQuery } from "@apollo/client"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { formatDate } from "./../../../utils/format-date"
import checkIcon from "./../../assets/icons/check.svg"
import Toast from "./../../components/Toast"
import SortablePhoto from "./../../components/SortablePhoto"

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
    fetchPolicy: "no-cache",
  })

  // ✅ Editable states
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedDate, setEditedDate] = useState("")
  const [actualPassphrase, setActualPassphrase] = useState("")
  const maskedPassphrase = actualPassphrase.replace(/./g, "*")
  const [photos, setPhotos] = useState([])

  // ✅ Toast + validation states
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  // ✅ Load gallery data into state
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
      setActualPassphrase("")
      setPhotos(g.photos || [])
    }
  }, [data])

  // ✅ DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const validateForm = () => {
    if (!editedTitle.trim()) return "Title cannot be empty."
    if (editedDate.trim()) {
      const testDate = Date.parse(editedDate.trim())
      if (isNaN(testDate)) return "Please enter a valid date format."
    }
    if (actualPassphrase && actualPassphrase.length < 4) {
      return "Passphrase must be at least 4 characters."
    }
    return ""
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    setPhotos((items) => arrayMove(items, oldIndex, newIndex))
  }

  const handleSave = () => {
    const errorMsg = validateForm()
    if (errorMsg) {
      setToastType("error")
      setToastMessage(errorMsg)
      return
    }

    console.log("Saving edits:", {
      title: editedTitle,
      description: editedDescription,
      date: editedDate,
      passphrase: actualPassphrase,
      reorderedPhotos: photos.map((p) => p.id),
    })

    setToastType("success")
    setToastMessage("✅ Gallery saved!")
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

  const gallery = data?.gallery || { photos: [] }

  return (
    <main className="relative flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ✅ Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

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
          className="flex gap-2 items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-500"
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

        {/* Editable Passphrase */}
        <p
          className="text-gray-700 outline-none"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onFocus={(e) => (e.currentTarget.textContent = maskedPassphrase)}
          onInput={(e) => {
            const text = e.currentTarget.textContent || ""
            if (text.length > maskedPassphrase.length) {
              const newChar = text.slice(-1)
              setActualPassphrase((prev) => prev + newChar)
            } else if (text.length < maskedPassphrase.length) {
              setActualPassphrase((prev) => prev.slice(0, -1))
            }
            e.currentTarget.textContent = actualPassphrase.replace(/./g, "*")
            const range = document.createRange()
            const sel = window.getSelection()
            range.selectNodeContents(e.currentTarget)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
          }}
          onBlur={(e) =>
            (e.currentTarget.textContent =
              maskedPassphrase || "Enter passphrase")
          }
        >
          {maskedPassphrase || "Enter passphrase"}
        </p>
      </section>

      {/* ✅ Photos Section with Drag-and-Drop */}
      <section>
        <h2 className="text-lg font-semibold text-carbon-blue-700 mb-4">
          Photos
        </h2>

        {photos.length === 0 ? (
          <p className="text-gray-500">No photos in this gallery yet.</p>
        ) : (
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
        )}
      </section>
    </main>
  )
}
