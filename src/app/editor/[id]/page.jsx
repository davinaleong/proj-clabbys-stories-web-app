"use client"
import { useParams, useRouter } from "next/navigation"
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
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import dayjs from "dayjs"
import { formatDate } from "../../utils/format-date"
import { env } from "../../lib/env"
import { passphraseGenerator } from "./../../utils/passphrase-generator"
import iconCheck from "./../../assets/icons/check.svg"
import iconLoaderWhite from "./../../assets/icons/loader-circle-w.svg"
import iconImage from "./../../assets/icons/image.svg"
import iconArchive from "./../../assets/icons/archive-w.svg"
import iconLock from "./../../assets/icons/lock.svg"
import Toast from "./../../components/Toast"
import PhotosManager from "./../../components/PhotosManager"
import SortablePhoto from "./../../components/SortablePhoto"
import DatePicker from "./../../components/DatePicker"
import StatusPicker from "./../../components/StatusPicker"
import ContextMenu from "./../../components/ContextMenu"
import PassphraseModal from "./../../components/PassphraseModal"
import PhotoMetadataModal from "./../../components/PhotoMetadataModal"

// ==============================
// ✅ Queries
// ==============================
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
        title
        description
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

const GET_GALLERIES_MIN = gql`
  query GetGalleriesMin {
    galleries {
      id
      title
    }
  }
`

// ==============================
// ✅ Mutations
// ==============================
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

const ARCHIVE_GALLERY = gql`
  mutation ArchiveGallery($id: ID!) {
    archiveGallery(id: $id) {
      id
      deletedAt
    }
  }
`

const MOVE_PHOTO = gql`
  mutation MovePhoto($photoId: ID!, $toGalleryId: ID!) {
    movePhotoToGallery(photoId: $photoId, toGalleryId: $toGalleryId) {
      id
      galleryId
    }
  }
`

const DELETE_PHOTO = gql`
  mutation DeletePhoto($id: ID!) {
    deletePhoto(id: $id) {
      id
    }
  }
`

export default function UpdateGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = params?.id
  const galleryId = Array.isArray(rawId) ? rawId[0] : rawId

  const { data, loading, error, refetch } = useQuery(GET_GALLERY, {
    variables: { id: galleryId },
    fetchPolicy: "no-cache",
  })

  const { data: enumData } = useQuery(GET_GALLERY_STATUS_ENUM)
  const statusOptions = enumData?.__type?.enumValues || []

  const { data: allGalsData } = useQuery(GET_GALLERIES_MIN, {
    fetchPolicy: "cache-first",
  })
  const allGalleries = (allGalsData?.galleries ?? []).filter(
    (g) => g.id !== galleryId
  )

  const [updateGalleryMutation] = useMutation(UPDATE_GALLERY)
  const [archiveGalleryMutation] = useMutation(ARCHIVE_GALLERY)
  const [updatePhotoOrderMutation] = useMutation(UPDATE_PHOTO_ORDER)
  const [movePhotoMutation] = useMutation(MOVE_PHOTO)
  const [deletePhotoMutation] = useMutation(DELETE_PHOTO)

  // ✅ Editable states
  const [editedTitle, setEditedTitle] = useState("Untitled Gallery")
  const [editedDescription, setEditedDescription] = useState(
    "No description provided."
  )
  const [editedDate, setEditedDate] = useState("No date is set")
  const [isoDateValue, setIsoDateValue] = useState(null)
  const [editedStatus, setEditedStatus] = useState("DRAFT")

  const statusFieldRef = useRef(null)
  const dateFieldRef = useRef(null)

  const [isStatusOpen, setStatusOpen] = useState(false)
  const [isPickerOpen, setPickerOpen] = useState(false)

  const [photos, setPhotos] = useState([])

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  // ✅ Buttons state
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [isPhotoManagerOpen, setPhotoManagerOpen] = useState(false)

  // 🆕 Passphrase modal state
  const [isPassphraseOpen, setPassphraseOpen] = useState(false)
  const [seedPassphrase, setSeedPassphrase] = useState("")

  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [isMetadataOpen, setMetadataOpen] = useState(false)

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

      const defaultStatus = statusOptions
        .map((opt) => opt.name)
        .includes(g.status)
        ? g.status
        : statusOptions[0]?.name || "DRAFT"
      setEditedStatus(defaultStatus)

      // Seed the modal with a reasonable default when opened
      setSeedPassphrase(env.DEFAULT_PASSPHRASE || passphraseGenerator())

      setPhotos(g.photos || [])
    }
  }, [data, statusOptions])

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
    return ""
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)

    const newOrder = arrayMove(photos, oldIndex, newIndex).map((p, idx) => ({
      ...p,
      position: idx,
    }))
    setPhotos(newOrder)
  }

  const handleSave = async () => {
    const errorMsg = validateForm()
    if (errorMsg) {
      setToastType("error")
      setToastMessage(errorMsg)
      return
    }

    setSaving(true)
    try {
      // Convert date to ISO
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

      // Build mutation payload — 🔒 passphrase REMOVED from here
      const updateData = {
        title: editedTitle,
        description: editedDescription,
        date: isoDate,
        status: editedStatus,
      }

      // Save gallery details
      await updateGalleryMutation({
        variables: { id: galleryId, data: updateData },
      })

      // Save photo order
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
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      await archiveGalleryMutation({ variables: { id: galleryId } })
      setToastType("success")
      setToastMessage("✅ Gallery archived successfully!")
      setTimeout(() => {
        router.push("/editor/")
      }, 1200)
    } catch (err) {
      console.error("Archive failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to archive gallery.")
    }
  }

  async function movePhoto(photoId, toGalleryId) {
    try {
      await movePhotoMutation({ variables: { photoId, toGalleryId } })
      setToastType("success")
      setToastMessage("✅ Photo moved.")
      await refetch()
    } catch (e) {
      setToastType("error")
      setToastMessage("❌ Failed to move photo.")
    }
  }

  async function removePhoto(photoId) {
    try {
      await deletePhotoMutation({ variables: { id: photoId } })
      setPhotos((ps) => ps.filter((p) => p.id !== photoId))
      setToastType("success")
      setToastMessage("🗑️ Photo removed.")
    } catch (e) {
      setToastType("error")
      setToastMessage("❌ Failed to remove photo.")
    }
  }

  const openPassphraseModal = () => {
    // Seed with default or generator every time it opens (optional)
    setSeedPassphrase(env.DEFAULT_PASSPHRASE || passphraseGenerator())
    setPassphraseOpen(true)
  }

  const savePassphrase = async (value) => {
    if (typeof value !== "string" || value.trim().length < 4) {
      setToastType("error")
      setToastMessage("Passphrase must be at least 4 characters.")
      return
    }
    try {
      const pass = value.trim()
      await setGalleryPassphraseMutation({
        variables: { id: galleryId, passphrase: pass },
      })
      setPassphraseOpen(false)
      setToastType("success")
      setToastMessage("🔒 Passphrase saved.")
    } catch (e) {
      console.error(e)
      setToastType("error")
      setToastMessage("❌ Failed to set passphrase.")
    }
  }

  function openMetadata(photo) {
    setSelectedPhoto(photo)
    setMetadataOpen(true)
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
      {/* ✅ Title + Actions */}
      <header className="flex justify-between items-center">
        <h1
          className="font-serif text-3xl font-bold text-carbon-blue-700 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setEditedTitle(e.currentTarget.textContent)}
        >
          {editedTitle}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setPhotoManagerOpen(true)}
            className="flex gap-2 items-center px-4 py-2 rounded-md transition bg-neutral-500 hover:bg-neutral-700 text-white"
          >
            <Image src={iconImage} alt="Image Icon" width={16} height={16} />
            Photos
          </button>

          {/* 🆕 Show only when PUBLISHED */}
          {(true || editedStatus === "PUBLISHED") && (
            <button
              onClick={openPassphraseModal}
              className="flex gap-2 items-center px-4 py-2 rounded-md transition bg-neutral-500 hover:bg-neutral-700 text-white"
            >
              <Image src={iconLock} alt="Lock Icon" width={16} height={16} />
              Set Passphrase
            </button>
          )}

          <button
            onClick={handleArchive}
            disabled={archiving}
            className={`flex gap-2 items-center px-4 py-2 rounded-md  text-white transition ${
              archiving
                ? "bg-amber-500 opacity-80 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-700"
            }`}
          >
            {archiving ? (
              <>
                <Image
                  src={iconLoaderWhite}
                  alt="Archiving..."
                  width={18}
                  height={18}
                  className="animate-spin"
                />
                Archiving&hellip;
              </>
            ) : (
              <>
                <Image
                  src={iconArchive}
                  alt="Archive Icon"
                  width={16}
                  height={16}
                />
                Archive
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex gap-2 items-center px-4 py-2 rounded-md  text-white transition ${
              saving
                ? "bg-carbon-blue-500 opacity-80 cursor-not-allowed"
                : "bg-carbon-blue-500 hover:bg-carbon-blue-700"
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
                <Image
                  src={iconCheck}
                  alt="Check Icon"
                  width={16}
                  height={16}
                />
                Save
              </>
            )}
          </button>
        </div>
      </header>

      {/* ✅ Editable Fields */}
      <section>
        {/* ✅ Gallery URL Field */}
        <div className="relative mt-2">
          <p
            className="text-gray-800 outline-none"
            contentEditable
            suppressContentEditableWarning
            onClick={async (e) => {
              try {
                const url = e.currentTarget.textContent
                if (url) {
                  await navigator.clipboard.writeText(url)
                  setToastType("success")
                  setToastMessage("📋 Gallery link copied to clipboard!")
                }
              } catch (err) {
                console.error("Clipboard copy failed:", err)
                setToastType("error")
                setToastMessage("❌ Failed to copy link.")
              }
            }}
          >
            {`${env.WEB_URL}/galleries/${galleryId}`}
          </p>
        </div>

        {/* Description */}
        <div className="relative mt-2">
          <p
            className="text-gray-800 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setEditedDescription(e.currentTarget.textContent)}
          >
            {editedDescription}
          </p>
        </div>

        {/* ✅ Clickable Date Field */}
        <div className="relative mt-2">
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
        <div className="relative mt-2">
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
            onSelect={(selected) => {
              const selectedStatus = statusOptions.find(
                (opt) => opt.name === selected
              )?.name
              if (!selectedStatus) return
              setEditedStatus(selectedStatus)
            }}
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
                  <ContextMenu
                    key={photo.id}
                    anchor={<SortablePhoto photo={photo} />}
                    items={[
                      {
                        id: "edit-metadata",
                        label: "Edit Metadata",
                        onSelect: () => openMetadata(photo),
                      },
                      "separator",
                      { id: "move-header", label: "Move to…", disabled: true },
                      ...allGalleries.map((g) => ({
                        id: `move-${g.id}`,
                        label: g.title || "Untitled",
                        onSelect: () => movePhoto(photo.id, g.id),
                      })),
                      "separator",
                      {
                        id: "remove",
                        label: "Remove",
                        danger: true,
                        onSelect: () => removePhoto(photo.id),
                      },
                    ]}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* ✅ Toast */}
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {/* ✅ Photos Manager */}
      <PhotosManager
        isOpen={isPhotoManagerOpen}
        onClose={() => setPhotoManagerOpen(false)}
        galleryId={galleryId}
        onUploadComplete={async () => {
          await refetch()
          setPhotoManagerOpen(false)
        }}
      />

      {/* 🆕 Passphrase Modal */}
      <PassphraseModal
        open={isPassphraseOpen}
        onClose={() => setPassphraseOpen(false)}
        galleryId={galleryId}
        seed={seedPassphrase}
        generatePassphrase={() => passphraseGenerator()}
        onSaved={() => {
          setToastType("success")
          setToastMessage("🔒 Passphrase saved.")
        }}
      />

      <PhotoMetadataModal
        open={isMetadataOpen}
        onClose={async (saved) => {
          setMetadataOpen(false)
          setSelectedPhoto(null)
          if (saved) await refetch() // refresh photos
        }}
        photo={selectedPhoto}
      />
    </main>
  )
}
