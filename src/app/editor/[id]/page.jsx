"use client"
import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
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
import { formatDate } from "../../../utils/format-date"
import checkIcon from "./../../assets/icons/check.svg"
import Toast from "../../components/Toast"

// ✅ Queries
const GET_GALLERY = gql`
  query GetGallery($id: ID!) {
    gallery(id: $id) {
      id
      title
      description
      date
      passphraseHash
      createdAt
      photos {
        id
        imageUrl
        caption
        takenAt
        position
      }
    }
  }
`

// ✅ Mutations
const UPDATE_GALLERY = gql`
  mutation UpdateGallery($id: ID!, $data: UpdateGalleryInput!) {
    updateGallery(id: $id, data: $data) {
      id
      title
      description
      date
    }
  }
`

const UPDATE_PHOTO_ORDER = gql`
  mutation UpdatePhotoOrder($updates: [PhotoOrderUpdateInput!]!) {
    updatePhotoOrder(updates: $updates) {
      id
      position
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

  const [updateGalleryMutation] = useMutation(UPDATE_GALLERY)
  const [updatePhotoOrderMutation] = useMutation(UPDATE_PHOTO_ORDER)

  // ✅ Editable states
  const [editedTitle, setEditedTitle] = useState("Untitled Gallery")
  const [editedDescription, setEditedDescription] = useState(
    "No description provided."
  )
  const [editedDate, setEditedDate] = useState("No date is set")
  const [actualPassphrase, setActualPassphrase] = useState("Set a passphrase")
  const maskedPassphrase = actualPassphrase.replace(/./g, "*")
  const [photos, setPhotos] = useState([])

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  useEffect(() => {
    if (data?.gallery) {
      const g = data.gallery

      setEditedTitle(g.title || "Untitled Gallery")
      setEditedDescription(g.description || "No description provided.")

      if (!g.date || Number(g.date) < 0) {
        setEditedDate("No date is set")
      } else {
        const parsedDate = new Date(Number(g.date))
        setEditedDate(formatDate(parsedDate.toISOString(), "EEEE_DD_MMM_YYYY"))
      }

      setActualPassphrase("")
      setPhotos(g.photos || [])
    }
  }, [data])

  // ✅ Drag and drop sensors
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

    const newOrder = arrayMove(photos, oldIndex, newIndex).map(
      (p, idx) => ({ ...p, position: idx }) // ✅ assign new positions
    )
    setPhotos(newOrder)
  }

  const handleSave = async () => {
    const errorMsg = validateForm()
    if (errorMsg) {
      setToastType("error")
      setToastMessage(errorMsg)
      return
    }

    try {
      // ✅ Convert human-readable date back to ISO
      const parsedDate = editedDate.trim() ? new Date(editedDate) : null
      const isoDate =
        parsedDate && !isNaN(parsedDate) ? parsedDate.toISOString() : null

      // ✅ 1. Save gallery details
      await updateGalleryMutation({
        variables: {
          id: galleryId,
          data: {
            title: editedTitle,
            description: editedDescription,
            date: isoDate, // <-- ISO format
            passphrase: actualPassphrase || undefined,
          },
        },
      })

      // ✅ 2. Save photo order
      const updates = photos.map((p, index) => ({
        photoId: p.id,
        position: index,
      }))

      await updatePhotoOrderMutation({ variables: { updates } })

      setToastType("success")
      setToastMessage("✅ Gallery details & photo order saved!")
    } catch (err) {
      console.error("Save failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to save gallery. Try again.")
    }
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

  return (
    <main className="relative flex-1 w-full max-w-6xl mx-auto px-4 flow sm:px-6 py-8">
      {/* ✅ Toast */}
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {/* ✅ Title + Save */}
      <header className="flex justify-between items-center">
        <h1
          className="font-serif text-3xl font-bold text-carbon-blue-700 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setEditedTitle(e.currentTarget.textContent)}
        >
          {editedTitle}
        </h1>

        <button
          className="flex gap-2 items-center bg-carbon-blue-700 text-white px-4 py-2 rounded-md hover:bg-carbon-blue-500"
          onClick={handleSave}
        >
          <Image src={checkIcon} alt="Check Icon" width={16} height={16} /> Save
        </button>
      </header>

      {/* ✅ Editable Fields */}
      <section>
        <p
          className="text-gray-800 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setEditedDescription(e.currentTarget.textContent)}
        >
          {editedDescription}
        </p>

        <p
          className="text-gray-700 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setEditedDate(e.currentTarget.textContent)}
        >
          {editedDate}
        </p>

        <p
          className="text-gray-700 outline-none"
          contentEditable
          suppressContentEditableWarning
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
              maskedPassphrase || "Set a passphrase")
          }
        >
          {maskedPassphrase || "Set a passphrase"}
        </p>
      </section>

      {/* ✅ Photos with drag-and-drop */}
      <section>
        <h2 className="text-lg font-semibold text-carbon-blue-700 mb-4 sr-only">
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

/** ✅ SortablePhoto Component */
function SortablePhoto({ photo }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden shadow hover:shadow-lg transition-all"
    >
      <Image
        src={photo.imageUrl}
        alt={photo.caption || "Photo"}
        fill
        className="object-cover"
      />
    </div>
  )
}
