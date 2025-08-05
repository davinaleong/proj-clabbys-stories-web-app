"use client"
import { useParams, useRouter } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { env } from "./../../../lib/env"
import { formatDate } from "./../../../utils/format-date"
import iconRotate from "./../../../assets/icons/rotate-ccw-w.svg"
import iconTrash from "./../../../assets/icons/trash-2-w.svg"
import iconBan from "./../../../assets/icons/ban.svg"
import Toast from "./../../../components/Toast"
import Thumbnail from "./../../../components/Thumbnail"

const GET_ARCHIVE = gql`
  query GetArchive($id: ID!) {
    archive(id: $id) {
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

const RESTORE_ARCHIVE = gql`
  mutation RestoreArchive($id: ID!) {
    restoreGallery(id: $id) {
      id
      deletedAt
    }
  }
`

const DELETE_ARCHIVE = gql`
  mutation DeleteArchive($id: ID!) {
    deleteGallery(id: $id) {
      id
    }
  }
`

export default function UpdateArchivePage() {
  const params = useParams()
  const router = useRouter()

  const archiveId = params.id

  const { data, loading, error, refetch } = useQuery(GET_ARCHIVE, {
    variables: { id: archiveId },
    fetchPolicy: "no-cache",
  })

  const [restoreArchiveMutation] = useMutation(RESTORE_ARCHIVE)
  const [deleteArchiveMutation] = useMutation(DELETE_ARCHIVE)

  const [photos, setPhotos] = useState([])
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  const [restoring, setRestoring] = useState(false)
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPhotoManagerOpen, setPhotoManagerOpen] = useState(false)

  useEffect(() => {
    if (data?.archive) {
      setPhotos(data.archive.photos || [])
    }
  }, [data])

  const handleRestore = async () => {
    setRestoring(true)
    try {
      await restoreArchiveMutation({ variables: { id: archiveId } })
      setToastType("success")
      setToastMessage("Archive restored!")
      setTimeout(() => {
        router.push(`/editor/${archiveId}`)
      }, 1200)
    } catch (err) {
      setToastType("error")
      setToastMessage("Failed to restore archive.")
    } finally {
      setRestoring(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteArchiveMutation({ variables: { id: archiveId } })
      setToastType("success")
      setToastMessage("Archive permanently deleted!")
      setTimeout(() => {
        router.push("/editor/")
      }, 1200)
    } catch (err) {
      setToastType("error")
      setToastMessage("Failed to delete archive.")
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading archive...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading archive: {error.message}</p>
      </main>
    )
  }

  const a = data.archive

  return (
    <main className="relative flex-1 w-full max-w-6xl mx-auto px-4 flow sm:px-6 py-8">
      <header className="flex justify-between items-center">
        <h1 className="font-serif text-3xl font-bold text-carbon-blue-700">
          {a.title}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex gap-2 items-center px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-700"
          >
            <Image src={iconRotate} alt="Restore Icon" width={16} height={16} />
            {restoring ? "Restoring…" : "Restore"}
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex gap-2 items-center px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-700"
          >
            <Image src={iconTrash} alt="Delete Icon" width={16} height={16} />
            Delete Permanently
          </button>
        </div>
      </header>

      <p className="text-gray-800">{a.description}</p>
      <p className="text-gray-800">{formatDate(a.date, "EEEE_D_MMM_YYYY")}</p>

      {/* ✅ Photos (no drag-and-drop) */}
      <section className="mt-6">
        {photos.length === 0 ? (
          <p className="text-gray-500">No photos in this archive yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <Thumbnail key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </section>

      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white p-6 rounded shadow-lg max-w-sm w-full flow transition-opacity duration-200 ${
              deleting ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <p>Are you sure you want to permanently delete this archive?</p>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="px-4 py-2 flex gap-2 bg-gray-300 rounded"
                onClick={() => setConfirmOpen(false)}
              >
                <Image src={iconBan} alt="Ban Icon" width={16} height={16} />
                Cancel
              </button>
              <button
                className="px-4 py-2 flex gap-2 bg-red-600 text-white rounded"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Image
                  src={iconTrash}
                  alt="Trash Icon"
                  width={16}
                  height={16}
                />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
