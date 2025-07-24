"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import iconLoaderWhite from "./../../assets/icons/loader-circle-w.svg"
import DatePicker from "./../../components/DatePicker"
import Toast from "./../../components/Toast"

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const MAX_FILES = 5
const MAX_FILE_SIZE_MB = 5

export default function PhotosPage() {
  const [galleryName, setGalleryName] = useState("Untitled Gallery")
  const [title, setTitle] = useState("Untitled Photo Batch")
  const [description, setDescription] = useState("No description provided.")
  const [prettyDate, setPrettyDate] = useState("No date is set")
  const [isoDateValue, setIsoDateValue] = useState(null)

  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState([])

  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  const dateFieldRef = useRef(null)
  const [isPickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = (files) => {
    const selected = Array.from(files)
    const newErrors = []

    if (selected.length > MAX_FILES) {
      newErrors.push(`You can only upload up to ${MAX_FILES} photos at a time.`)
    }

    const validFiles = selected.filter((file) => {
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        newErrors.push(`${file.name} is not a supported format.`)
        return false
      }
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        newErrors.push(
          `${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`
        )
        return false
      }
      return true
    })

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setToastType("error")
      setToastMessage("⚠️ Some photos were skipped due to errors.")
    } else {
      setErrors([])
    }

    const preview = validFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    setPhotos(preview)

    if (validFiles.length > 0) {
      setUploading(true)
      setTimeout(() => {
        setUploading(false) // simulate upload complete
        setToastType("success")
        setToastMessage("✅ Photos uploaded successfully!")
      }, 2000)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const triggerFileBrowser = () => fileInputRef.current?.click()

  return (
    <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flow">
      {/* ✅ Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {/* ✅ Heading (gallery name) */}
      <header className="flex justify-between items-center">
        <h1
          className="font-serif text-3xl font-bold text-carbon-blue-700 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setGalleryName(e.currentTarget.textContent)}
        >
          {galleryName}
        </h1>
      </header>

      {/* ✅ Sub-fields similar to CreateGallery */}
      <section className="mt-4 space-y-4">
        {/* Title */}
        <p
          className="text-gray-800 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setTitle(e.currentTarget.textContent)}
        >
          {title}
        </p>

        {/* Description */}
        <p
          className="text-gray-800 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setDescription(e.currentTarget.textContent)}
        >
          {description}
        </p>

        {/* Clickable Date Field (with DatePicker) */}
        <div className="relative inline-block">
          <p
            ref={dateFieldRef}
            className="text-gray-800 outline-none cursor-pointer"
            onClick={() => setPickerOpen((prev) => !prev)}
          >
            {prettyDate}
          </p>
          <DatePicker
            anchorRef={dateFieldRef}
            isOpen={isPickerOpen}
            onClose={() => setPickerOpen(false)}
            outputFormat="EEEE_D_MMM_YYYY"
            onDateSelected={({ iso, formatted }) => {
              setPrettyDate(formatted)
              setIsoDateValue(iso)
            }}
          />
        </div>
      </section>

      {/* ✅ Photo Upload Area */}
      <section
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mt-6 border-2 border-dashed border-carbon-blue-300 rounded-md p-6 text-center cursor-pointer hover:border-carbon-blue-500 transition"
        onClick={triggerFileBrowser}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Image
              src={iconLoaderWhite}
              alt="Uploading..."
              width={30}
              height={30}
              className="animate-spin"
            />
            <p className="text-carbon-blue-700">Uploading photos…</p>
          </div>
        ) : (
          <>
            <p className="text-carbon-blue-700">
              Drag & drop up to {MAX_FILES} photos here, or tap/click to browse
            </p>
            <p className="text-sm text-carbon-blue-500 mt-2">
              Supported: JPG, PNG, GIF, WEBP • Max {MAX_FILE_SIZE_MB}MB each
            </p>
          </>
        )}
      </section>

      {/* ✅ Errors */}
      {errors.length > 0 && (
        <div className="mt-4 text-red-500 space-y-1">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {/* ✅ Previews */}
      {photos.length > 0 && (
        <section className="mt-6 grid grid-cols-2 gap-4">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded overflow-hidden border"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 bg-black bg-opacity-40 text-white text-xs p-1 truncate">
                {photo.name}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
