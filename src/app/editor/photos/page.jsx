"use client"
import { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import Image from "next/image"

const CREATE_PHOTO = gql`
  mutation CreatePhoto($data: CreatePhotoInput!) {
    createPhoto(data: $data) {
      id
      title
      description
      imageUrl
    }
  }
`

export default function SinglePhotoUploader({ galleryId }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("DRAFT")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const [createPhotoMutation] = useMutation(CREATE_PHOTO)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setTitle(selected.name.replace(/\.[^/.]+$/, "")) // default title = filename
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a photo first")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // ✅ Upload single file
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const { result } = await res.json()

      console.log("✅ Uploaded to Cloudinary:", result)

      // ✅ Call GraphQL mutation with metadata
      const { data } = await createPhotoMutation({
        variables: {
          data: {
            galleryId,
            title,
            description,
            imageUrl: result.secure_url,
            thumbUrl: result.secure_url,
            caption: description,
            takenAt: new Date().toISOString(),
            fileSize: result.bytes,
          },
        },
      })

      console.log("✅ Photo saved to GraphQL:", data.createPhoto)
      alert("✅ Photo uploaded & metadata saved!")
      // reset
      setFile(null)
      setPreview(null)
      setTitle("")
      setDescription("")
      setStatus("DRAFT")
    } catch (err) {
      console.error("❌ Upload error:", err)
      setError("Failed to upload photo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Upload Single Photo</h2>

      {/* File input */}
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-4"
      />

      {/* Preview */}
      {preview && (
        <div className="mb-4">
          <Image
            src={preview}
            alt="Preview"
            width={300}
            height={200}
            className="rounded border"
          />
        </div>
      )}

      {/* Metadata fields (only show when photo selected) */}
      {file && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Photo Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="DRAFT">Draft</option>
              <option value="PRIVATE">Private</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-600 mt-3">{error}</p>}

      {/* Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => {
            setFile(null)
            setPreview(null)
            setTitle("")
            setDescription("")
            setStatus("DRAFT")
          }}
          disabled={uploading}
          className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          Reset
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`px-4 py-2 rounded ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {uploading ? "Uploading…" : "Save Photo"}
        </button>
      </div>
    </div>
  )
}
