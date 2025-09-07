"use client"
import { useState, useEffect } from "react"
import { useMutation, gql } from "@apollo/client"
import Image from "next/image"
import iconBan from "./../assets/icons/ban-w.svg"
import iconCheck from "./../assets/icons/check.svg"

const UPDATE_PHOTO = gql`
  mutation UpdatePhoto($id: ID!, $data: UpdatePhotoInput!) {
    updatePhoto(id: $id, data: $data) {
      id
      title
      description
      takenAt
      position
    }
  }
`

export default function PhotoMetadataModal({ open, onClose, photo }) {
  const [title, setTitle] = useState(photo?.title || "")
  const [description, setDescription] = useState(photo?.description || "")
  const [takenAt, setTakenAt] = useState(photo?.takenAt || "")

  const [updatePhoto, { loading }] = useMutation(UPDATE_PHOTO)

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || "")
      setDescription(photo.description || "")
      setTakenAt(photo.takenAt || "")
    }
  }, [photo])

  if (!open) return null

  const handleSave = async () => {
    try {
      await updatePhoto({
        variables: {
          id: photo.id,
          data: { title, description, takenAt },
        },
      })
      onClose(true) // true = saved
    } catch (err) {
      console.error("❌ Failed to update photo:", err)
      onClose(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-pastel-pink-500 rounded-sm shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl text-carbon-blue-500 font-serif font-bold">
          Edit Photo Metadata
        </h2>

        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-pastel-pink-700 rounded-sm p-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-pastel-pink-700 rounded-sm p-2 mt-1"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Taken At</label>
          <input
            type="datetime-local"
            value={takenAt ? new Date(takenAt).toISOString().slice(0, 16) : ""}
            onChange={(e) => setTakenAt(new Date(e.target.value).toISOString())}
            className="w-full bg-pastel-pink-700 rounded-sm p-2 mt-1"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onClose(false)}
            className="flex gap-2 px-4 py-2 rounded-sm text-white bg-gray-500 hover:bg-gray-600"
          >
            <Image src={iconBan} alt="Ban Icon" width={16} height={16} /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex gap-2 px-4 py-2 rounded-sm bg-carbon-blue-500 text-white hover:bg-carbon-blue-600 disabled:opacity-50"
          >
            <Image src={iconCheck} alt="Check Icon" width={16} height={16} />{" "}
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
