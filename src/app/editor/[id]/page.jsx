"use client"
import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
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
import dayjs from "dayjs"
import { formatDate } from "../../utils/format-date"
import checkIcon from "./../../assets/icons/check.svg"
import iconLoaderWhite from "./../../assets/icons/loader-circle-w.svg"
import Toast from "./../../components/Toast"
import DatePicker from "./../../components/DatePicker"
import StatusPicker from "./../../components/StatusPicker"

// ✅ Queries
const GET_GALLERY = gql`
  query GetGallery($id: ID!) {
    gallery(id: $id) {
      id
      title
      description
      date
      status
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

const GET_GALLERY_STATUS_ENUM = gql`
  query GetGalleryStatusEnum {
    __type(name: "GalleryStatus") {
      enumValues {
        name
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
      status
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

export default function UpdateGalleryPage() {
  const params = useParams()
  const galleryId = params.id

  const { data, loading, error } = useQuery(GET_GALLERY, {
    variables: { id: galleryId },
    fetchPolicy: "no-cache",
  })

  const { data: enumData } = useQuery(GET_GALLERY_STATUS_ENUM)
  const statusOptions = enumData?.__type?.enumValues || []

  const [updateGalleryMutation] = useMutation(UPDATE_GALLERY)
  const [updatePhotoOrderMutation] = useMutation(UPDATE_PHOTO_ORDER)

  // ✅ Editable states
  const [editedTitle, setEditedTitle] = useState("Untitled Gallery")
  const [editedDescription, setEditedDescription] = useState(
    "No description provided."
  )
  const [editedDate, setEditedDate] = useState("No date is set")
  const [isoDateValue, setIsoDateValue] = useState(null) // store ISO for saving

  const [actualPassphrase, setActualPassphrase] = useState("Set a passphrase")
  const maskedPassphrase = actualPassphrase.replace(/./g, "*")

  const [editedStatus, setEditedStatus] = useState("DRAFT")
  const [isStatusOpen, setStatusOpen] = useState(false)
  const statusFieldRef = useRef(null)

  const [photos, setPhotos] = useState([])

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  // ✅ Date Picker open/close
  const [isPickerOpen, setPickerOpen] = useState(false)
  const dateFieldRef = useRef(null)

  // ✅ New: saving state for Save button
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.gallery) {
      const g = data.gallery

      setEditedTitle(g.title || "Untitled Gallery")
      setEditedDescription(g.description || "No description provided.")

      if (!g.date || Number(g.date) < 0) {
        setEditedDate("No date is set")
        setIsoDateValue(null)
      } else {
        const parsedDate = new Date(Number(g.date))
        setIsoDateValue(parsedDate.toISOString())
        setEditedDate(formatDate(parsedDate.toISOString(), "EEEE_D_MMM_YYYY"))
      }

      setEditedStatus(g.status || "DRAFT")

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
    if (isoDateValue && isNaN(new Date(isoDateValue))) {
      return "Please select a valid date."
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

    setSaving(true) // ✅ start saving

    try {
      // ✅ Convert date to ISO
      let isoDate = null
      if (editedDate && editedDate !== "No date is set") {
        const parsed = dayjs(editedDate, [
          "dddd, D MMM YYYY",
          "ddd, D MMM YYYY",
          "D MMM YYYY",
          "D MMMM YYYY",
        ])
        if (parsed.isValid()) {
          isoDate = parsed.toISOString()
        }
      }

      // ✅ Build mutation payload
      const updateData = {
        title: editedTitle,
        description: editedDescription,
        date: isoDate,
        status: editedStatus,
      }

      if (actualPassphrase && actualPassphrase !== "Set a passphrase") {
        updateData.passphrase = actualPassphrase
      }

      // ✅ Save gallery details
      await updateGalleryMutation({
        variables: { id: galleryId, data: updateData },
      })

      // ✅ Save photo order
      const updates = photos.map((p, index) => ({
        photoId: p.id,
        position: index,
      }))
      await updatePhotoOrderMutation({ variables: { updates } })

      setToastType("success")
      setToastMessage("✅ Gallery details, passphrase & photo order saved!")
    } catch (err) {
      console.error("Save failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to save gallery. Try again.")
    } finally {
      setSaving(false) // ✅ end saving
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
          onClick={handleSave}
          disabled={saving}
          className={`flex gap-2 items-center px-4 py-2 rounded-md transition ${
            saving
              ? "bg-carbon-blue-500 opacity-80 cursor-not-allowed"
              : "bg-carbon-blue-700 hover:bg-carbon-blue-500 text-white"
          }`}
        >
          {saving ? (
            <>
              <Image
                src={iconLoaderWhite}
                alt="Saving..."
                width={18}
                height={18}
                className="animate-spin"
              />
              Saving&hellip;
            </>
          ) : (
            <>
              <Image src={checkIcon} alt="Check Icon" width={16} height={16} />
              Save
            </>
          )}
        </button>
      </header>

      {/* ✅ Editable Fields */}
      <section>
        {/* Description */}
        <p
          className="text-gray-800 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setEditedDescription(e.currentTarget.textContent)}
        >
          {editedDescription}
        </p>

        {/* ✅ Clickable Date Field */}
        <div className="relative">
          <p
            ref={dateFieldRef}
            className="text-gray-800 outline-none cursor-pointer"
            onClick={() => setPickerOpen((prev) => !prev)}
          >
            {editedDate || "No date is set"}
          </p>

          {/* ✅ Date Picker */}
          <DatePicker
            anchorRef={dateFieldRef}
            isOpen={isPickerOpen}
            onClose={() => setPickerOpen(false)}
            outputFormat="EEEE_D_MMM_YYYY"
            onDateSelected={({ iso, formatted }) => {
              setEditedDate(formatted)
              setIsoDateValue(iso)
            }}
          />
        </div>

        {/* ✅ Status Picker */}
        <div className="relative">
          <p
            ref={statusFieldRef}
            className="text-gray-800 outline-none cursor-pointer"
            onClick={() => setStatusOpen((prev) => !prev)}
          >
            {editedStatus}
          </p>
          <StatusPicker
            anchorRef={statusFieldRef}
            isOpen={isStatusOpen}
            options={statusOptions}
            currentStatus={editedStatus}
            onClose={() => setStatusOpen(false)}
            onSelect={(val) => setEditedStatus(val)}
          />
        </div>
      </section>

      {/* ✅ Photos drag-and-drop */}
      <section className="mt-6">
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
