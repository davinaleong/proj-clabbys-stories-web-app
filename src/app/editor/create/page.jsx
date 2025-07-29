"use client"
import { gql, useMutation } from "@apollo/client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import Toast from "./../../components/Toast"
import DatePicker from "./../../components/DatePicker"
import checkIcon from "./../../assets/icons/check.svg"
import loaderIcon from "./../../assets/icons/loader-circle-w.svg"

// ✅ Mutation for creating a gallery
const CREATE_GALLERY = gql`
  mutation CreateGallery($data: CreateGalleryInput!) {
    createGallery(data: $data) {
      id
      title
      description
      date
      status
    }
  }
`

export default function CreateGalleryPage() {
  const router = useRouter()
  const [createGalleryMutation] = useMutation(CREATE_GALLERY)

  // ✅ Form state
  const [newGalleryId, setNewGalleryId] = useState(null)
  const [title, setTitle] = useState("Untitled Gallery")
  const [description, setDescription] = useState("No description provided.")
  const [prettyDate, setPrettyDate] = useState("No date is set")
  const [isoDateValue, setIsoDateValue] = useState(null)

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  // ✅ Saving state for button
  const [saving, setSaving] = useState(false)

  // ✅ Date Picker modal state
  const [isPickerOpen, setPickerOpen] = useState(false)
  const dateFieldRef = useRef(null)

  const validateForm = () => {
    if (!title.trim()) return "Title cannot be empty."
    if (isoDateValue && isNaN(new Date(isoDateValue))) {
      return "Please select a valid date."
    }
    return ""
  }

  const handleCreate = async () => {
    const errorMsg = validateForm()
    if (errorMsg) {
      setToastType("error")
      setToastMessage(errorMsg)
      return
    }

    setSaving(true)

    try {
      const newGalleryData = {
        title: title.trim(),
        description: description.trim(),
        date: isoDateValue ?? null,
        status: "DRAFT",
      }

      const { data } = await createGalleryMutation({
        variables: { data: newGalleryData },
      })

      if (data?.createGallery?.id) {
        const newGalleryId = data.createGallery.id
        setNewGalleryId(newGalleryId)

        setToastType("success")
        setToastMessage("✅ Gallery created successfully!")

        setTimeout(() => {
          router.push(`/editor/${newGalleryId}`)
        }, 800)
      } else {
        throw new Error("No gallery ID returned")
      }
    } catch (err) {
      console.error("Create failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to create gallery. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flow">
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      <header className="flex justify-between items-center">
        <h1
          className="font-serif text-3xl font-bold text-carbon-blue-700 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setTitle(e.currentTarget.textContent)}
        >
          {title}
        </h1>

        <button
          className={`flex gap-2 items-center px-4 py-2 text-white rounded-md transition ${
            saving
              ? "bg-carbon-blue-500 opacity-80 cursor-not-allowed"
              : "bg-carbon-blue-500 hover:bg-carbon-blue-700"
          }`}
          onClick={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <>
              <Image
                src={loaderIcon}
                alt="Saving..."
                width={18}
                height={18}
                className="animate-spin"
              />
              Saving…
            </>
          ) : (
            <>
              <Image src={checkIcon} alt="Check Icon" width={16} height={16} />
              Save
            </>
          )}
        </button>
      </header>

      {/* ✅ Description */}
      <section className="mt-4">
        <p
          className="text-gray-800 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setDescription(e.currentTarget.textContent)}
        >
          {description}
        </p>

        <div className="relative inline-block">
          <p
            ref={dateFieldRef}
            className="text-gray-800 outline-none cursor-pointer"
            onClick={() => setPickerOpen((prev) => !prev)}
          >
            {prettyDate || "No date is set"}
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
    </main>
  )
}
