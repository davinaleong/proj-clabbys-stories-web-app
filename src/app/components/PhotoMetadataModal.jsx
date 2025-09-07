"use client"
import { useState, useEffect, useRef } from "react"
import { useMutation, gql } from "@apollo/client"
import Image from "next/image"
import DatePicker from "./DatePicker"
import { formatByEnum } from "./../lib/format-by-enum"
import iconBan from "./../assets/icons/ban.svg"
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

const FORMAT_ENUM = "EEEE_D_MMM_YYYY"

// --- helpers ---
function toDateObject(dateish) {
  if (!dateish) return null
  const v = Number.isFinite(+dateish) ? Number(dateish) : dateish
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

/** Normalize to UTC midnight for date-only semantics */
function toMidnightZISOString(dateish) {
  const d = toDateObject(dateish)
  if (!d) return null
  const mid = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  )
  return mid.toISOString()
}

export default function PhotoMetadataModal({ open, onClose, photo }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [takenAtIso, setTakenAtIso] = useState(null) // ISO @ 00:00Z
  const [takenAtLabel, setTakenAtLabel] = useState("") // pretty text

  const [updatePhoto, { loading }] = useMutation(UPDATE_PHOTO)

  // DatePicker anchor + state
  const takenAtFieldRef = useRef(null)
  const [isDateOpen, setDateOpen] = useState(false)

  // Prepopulate on open/photo change
  useEffect(() => {
    if (!open || !photo) return
    setTitle(photo.title || "")
    setDescription(photo.description || "")

    const iso = toMidnightZISOString(photo.takenAt)
    setTakenAtIso(iso)
    setTakenAtLabel(iso ? formatByEnum(iso, FORMAT_ENUM) : "")
  }, [open, photo])

  if (!open || !photo) return null

  const handleSave = async () => {
    try {
      await updatePhoto({
        variables: {
          id: photo.id,
          data: {
            title,
            description,
            takenAt: takenAtIso, // null if no date selected
          },
        },
      })
      onClose(true)
    } catch (err) {
      console.error("❌ Failed to update photo:", err)
      onClose(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl font-bold font-serif text-carbon-blue-700">
          Edit {title}
        </h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm bg-neutral-200 p-2 mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-sm bg-neutral-200 p-2 mt-1"
            rows={3}
          />
        </div>

        {/* Taken At (DatePicker) */}
        <div className="relative">
          <label className="block text-sm font-medium">Taken At</label>
          <div
            ref={takenAtFieldRef}
            className="w-full rounded-sm bg-neutral-200 p-2 mt-1 cursor-pointer select-none"
            onClick={() => setDateOpen((v) => !v)}
          >
            {takenAtLabel || "No date selected"}
          </div>

          <DatePicker
            anchorRef={takenAtFieldRef}
            isOpen={isDateOpen}
            onClose={() => setDateOpen(false)}
            initialDate={takenAtIso || null} // prepopulate picker
            outputFormat={FORMAT_ENUM}
            onDateSelected={({ iso /*, formatted*/ }) => {
              const normalized = toMidnightZISOString(iso)
              setTakenAtIso(normalized)
              setTakenAtLabel(
                normalized ? formatByEnum(normalized, FORMAT_ENUM) : ""
              )
              setDateOpen(false)
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 rounded-sm bg-gray-200 hover:bg-gray-400"
          >
            <Image
              src={iconBan}
              alt="Ban Icon"
              width={16}
              height={16}
              className="inline mr-2"
            />{" "}
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-sm bg-carbon-blue-500 text-white hover:bg-carbon-blue-700 disabled:opacity-50"
          >
            <Image
              src={iconCheck}
              alt="Check Icon"
              width={16}
              height={16}
              className="inline mr-2"
            />{" "}
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
