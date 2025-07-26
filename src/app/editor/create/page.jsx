"use client"
import { gql, useMutation } from "@apollo/client"
import Image from "next/image"
import { useRouter } from "next/navigation" // ✅ import router
import { useState, useRef } from "react"
import checkIcon from "./../../assets/icons/check.svg"
import loaderIcon from "./../../assets/icons/loader-circle-w.svg"
import imageIcon from "./../../assets/icons/image.svg"
import Toast from "./../../components/Toast"
import DatePicker from "./../../components/DatePicker"

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
  const router = useRouter() // ✅ initialize router

  const [createGalleryMutation] = useMutation(CREATE_GALLERY)

  // ✅ Form state
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

    setSaving(true) // ✅ start saving state

    try {
      const newGalleryData = {
        title: title.trim(),
        description: description.trim(),
        date: isoDateValue ?? null,
        status: "DRAFT", // always draft on create
      }

      const { data } = await createGalleryMutation({
        variables: { data: newGalleryData },
      })

      if (data?.createGallery?.id) {
        const newGalleryId = data.createGallery.id

        setToastType("success")
        setToastMessage("✅ Gallery created successfully!")

        // ✅ Redirect user to the editor page for this gallery
        setTimeout(() => {
          router.push(`/editor/${newGalleryId}`)
        }, 800) // short delay to show toast
      } else {
        throw new Error("No gallery ID returned")
      }
    } catch (err) {
      console.error("Create failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to create gallery. Try again.")
    } finally {
      setSaving(false) // ✅ reset saving state
    }
  }

  return (
    <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flow">
      {/* ✅ Toast */}
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {/* ✅ Title + Save Button */}
      <header className="flex justify-between items-center">
        <h1
          className="font-serif text-3xl font-bold text-carbon-blue-700 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setTitle(e.currentTarget.textContent)}
        >
          {title}
        </h1>

        <div className="flex gap-2">
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
                Saving&hellip;
              </>
            ) : (
              <>
                <Image
                  src={checkIcon}
                  alt="Check Icon"
                  width={16}
                  height={16}
                />
                Save
              </>
            )}
          </button>
          <button className="flex gap-2 items-center px-4 py-2 rounded-md transition bg-neutral-500 hover:bg-neutral-500 text-white opacity-80 cursor-not-allowed">
            <Image src={imageIcon} alt="Image Icon" width={16} height={16} />
            Manage Photos
          </button>
        </div>
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

        {/* ✅ Clickable Date Field */}
        <div className="relative inline-block">
          <p
            ref={dateFieldRef}
            className="text-gray-800 outline-none cursor-pointer"
            onClick={() => setPickerOpen((prev) => !prev)}
          >
            {prettyDate || "No date is set"}
          </p>

          {/* ✅ Date Picker Modal */}
          <DatePicker
            anchorRef={dateFieldRef}
            isOpen={isPickerOpen}
            onClose={() => setPickerOpen(false)}
            outputFormat="EEEE_D_MMM_YYYY"
            onDateSelected={({ iso, formatted }) => {
              setPrettyDate(formatted) // show pretty date
              setIsoDateValue(iso) // save ISO for backend
            }}
          />
        </div>
      </section>
    </main>
  )
}
