"use client"
import { useState } from "react"
import { gql, useMutation } from "@apollo/client"

// ✅ GraphQL mutation
const CREATE_PHOTOS = gql`
  mutation CreatePhotos($data: [CreatePhotoInput!]!) {
    createPhotos(data: $data) {
      id
      imageUrl
    }
  }
`

export default function PhotosManager({ isOpen, onClose, galleryId }) {
  const [photoData, setPhotoData] = useState([])
  const [errors, setErrors] = useState([])
  const [uploading, setUploading] = useState(false)

  const [createPhotosMutation] = useMutation(CREATE_PHOTOS)

  const MAX_FILES = 5
  const MAX_SIZE_MB = 5
  const ALLOWED_EXT = /\.(jpg|jpeg|png|gif|webp)$/i

  if (!isOpen) return null

  // ✅ Validate file type, size, count
  const validateFiles = (files) => {
    const issues = []
    if (files.length > MAX_FILES) {
      issues.push(`You can upload max ${MAX_FILES} photos at once.`)
    }
    for (let f of files) {
      if (!ALLOWED_EXT.test(f.name)) {
        issues.push(`${f.name} has unsupported format.`)
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        issues.push(`${f.name} exceeds ${MAX_SIZE_MB}MB.`)
      }
    }
    return issues
  }

  const handleFilesSelected = (files) => {
    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    const newPhotoData = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setPhotoData(newPhotoData)
    setErrors([])
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || [])
    handleFilesSelected(files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || [])
    handleFilesSelected(files)
  }

  const handleDragOver = (e) => e.preventDefault()

  // ✅ Multi upload → GraphQL
  const handleAddToGallery = async () => {
    if (!photoData.length) {
      setErrors(["Please select at least 1 photo."])
      return
    }

    setUploading(true)
    setErrors([])

    try {
      // 1️⃣ Prepare FormData
      const formData = new FormData()
      photoData.forEach((p) => formData.append("files", p.file))

      // 2️⃣ Upload all in one request
      const res = await fetch("/api/upload/multi", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Multi-upload failed")

      const { results } = await res.json() // same order as photoData

      // 3️⃣ Build GraphQL payload
      const gqlPayload = results.map((uploaded, idx) => ({
        galleryId,
        title: photoData[idx].file.name.replace(/\.[^/.]+$/, ""), // auto title from filename
        description: null,
        imageUrl: uploaded.secure_url,
        thumbUrl: uploaded.secure_url, // can use Cloudinary transformations later
        caption: null,
        takenAt: null,
        fileSize: uploaded.bytes,
      }))

      // 4️⃣ Call createPhotos mutation
      await createPhotosMutation({
        variables: { data: gqlPayload },
      })

      console.log("✅ Created photos!")

      // ✅ Done → reset & close
      setPhotoData([])
      onClose()
    } catch (err) {
      console.error("Multi-upload failed:", err)
      setErrors(["❌ Failed to upload photos. Try again."])
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-2xl font-bold text-carbon-blue-700">
            Photos Manager
          </h2>
          <button
            className="text-gray-600 hover:text-gray-900 text-xl"
            onClick={onClose}
            disabled={uploading}
          >
            ✕
          </button>
        </header>

        <p className="text-sm text-gray-500 mb-3">
          Adding to <span className="font-semibold">{galleryId}</span>
        </p>

        {/* Upload area */}
        <div
          className="border-2 border-dashed rounded-md p-6 text-center hover:border-carbon-blue-500"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {photoData.length === 0 ? (
            <>
              <p className="text-gray-600">Drag & drop your photos here</p>
              <p className="text-sm text-gray-400">
                or click below to select (Max {MAX_FILES} photos)
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                multiple
                className="hidden"
                id="photo-upload"
                onChange={handleFileInput}
              />
              <label
                htmlFor="photo-upload"
                className="mt-3 inline-block px-4 py-2 bg-carbon-blue-700 text-white rounded-md hover:bg-carbon-blue-500 cursor-pointer"
              >
                Choose Photos
              </label>
            </>
          ) : (
            <>
              <p className="text-gray-800 font-medium">
                {photoData.length} photo(s) selected:
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside my-2">
                {photoData.map((p) => (
                  <li key={p.file.name}>{p.file.name}</li>
                ))}
              </ul>
              <button
                className="text-sm text-red-500 underline mt-2"
                onClick={() => setPhotoData([])}
                disabled={uploading}
              >
                Clear selection
              </button>
            </>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 rounded-md p-3 mt-3 text-sm space-y-1">
            {errors.map((err, idx) => (
              <p key={idx}>• {err}</p>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              photoData.length === 0 || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 text-white"
            }`}
            onClick={handleAddToGallery}
            disabled={photoData.length === 0 || uploading}
          >
            {uploading ? "Uploading…" : `Add`}
          </button>
        </div>
      </div>
    </div>
  )
}
