"use client"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useState, useRef } from "react"
import Image from "next/image"
import EnumPicker from "./../../components/EnumPicker"
import Toast from "./../../components/Toast"
import iconLoaderWhite from "./../../assets/icons/loader-circle-w.svg"
import checkIcon from "./../../assets/icons/check.svg"

const GET_APP_SETTINGS = gql`
  query GetAppSettings {
    appSettings {
      id
      applicationName
      lightboxMode
      defaultSortOrder
      defaultDateFormat
    }
  }
`

const GET_SETTING_ENUMS = gql`
  query GetSettingEnums {
    lightbox: __type(name: "LightboxMode") {
      enumValues {
        name
      }
    }
    sortOrder: __type(name: "SortOrder") {
      enumValues {
        name
      }
    }
    dateFormat: __type(name: "DateFormat") {
      enumValues {
        name
      }
    }
  }
`

//
// ✅ Mutation to update settings
//
const UPDATE_APP_SETTING = gql`
  mutation UpdateAppSetting($id: ID!, $data: UpdateAppSettingInput!) {
    updateAppSetting(id: $id, data: $data) {
      id
      applicationName
      lightboxMode
      defaultSortOrder
      defaultDateFormat
    }
  }
`

export default function SettingsPage() {
  //
  // ✅ Fetch settings + enums
  //
  const { data, loading, error } = useQuery(GET_APP_SETTINGS, {
    fetchPolicy: "no-cache",
  })
  const { data: enumData } = useQuery(GET_SETTING_ENUMS)
  const [updateSettingMutation] = useMutation(UPDATE_APP_SETTING)

  //
  // ✅ UI states
  //
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  // Selected setting state
  const setting = data?.appSettings?.[0]
  const settingId = setting?.id

  const [appName, setAppName] = useState(setting?.applicationName || "My App")
  const [lightboxMode, setLightboxMode] = useState(
    setting?.lightboxMode || "BLACK"
  )
  const [sortOrder, setSortOrder] = useState(
    setting?.defaultSortOrder || "NEWEST"
  )
  const [dateFormat, setDateFormat] = useState(
    setting?.defaultDateFormat || "EEE_DD_MMM_YYYY"
  )

  // Dropdown open state
  const [openPicker, setOpenPicker] = useState(null) // "lightbox" | "sortOrder" | "dateFormat"

  //
  // ✅ Enum values
  //
  const lightboxOptions = enumData?.lightbox?.enumValues || []
  const sortOrderOptions = enumData?.sortOrder?.enumValues || []
  const dateFormatOptions = enumData?.dateFormat?.enumValues || []

  //
  // ✅ Save Handler
  //
  const handleSave = async () => {
    if (!settingId) return

    setSaving(true)
    try {
      await updateSettingMutation({
        variables: {
          id: settingId,
          data: {
            applicationName: appName.trim(),
            lightboxMode,
            defaultSortOrder: sortOrder,
            defaultDateFormat: dateFormat,
          },
        },
      })

      setToastType("success")
      setToastMessage("✅ Settings updated successfully!")
    } catch (err) {
      console.error("Save settings failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to save settings. Try again.")
    } finally {
      setSaving(false)
    }
  }

  //
  // ✅ Loading/Error states
  //
  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading settings...</p>
      </main>
    )
  }
  if (error) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading settings: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="relative flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* ✅ Toast */}
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {/* ✅ Header + Save button */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-bold text-carbon-blue-700">
          App Settings
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

      {/* ✅ Editable Fields */}
      <section className="space-y-6">
        {/* App Name */}
        <div>
          <label className="block text-sm text-carbon-blue-500 mb-1">
            Application Name
          </label>
          <p
            className="text-lg text-carbon-blue-800 outline-none border-b border-carbon-blue-300 focus:border-carbon-blue-500"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setAppName(e.currentTarget.textContent)}
          >
            {appName}
          </p>
        </div>

        {/* Lightbox Mode */}
        <div className="relative">
          <label className="block text-sm text-carbon-blue-500 mb-1">
            Lightbox Mode
          </label>
          <p
            className="text-lg text-carbon-blue-800 outline-none cursor-pointer border-b border-carbon-blue-300"
            onClick={() =>
              setOpenPicker(openPicker === "lightbox" ? null : "lightbox")
            }
          >
            {lightboxMode}
          </p>

          {openPicker === "lightbox" && (
            <EnumPicker
              options={lightboxOptions}
              current={lightboxMode}
              onSelect={(val) => {
                setLightboxMode(val)
                setOpenPicker(null)
              }}
            />
          )}
        </div>

        {/* Sort Order */}
        <div className="relative">
          <label className="block text-sm text-carbon-blue-500 mb-1">
            Photo Sort Order
          </label>
          <p
            className="text-lg text-carbon-blue-800 outline-none cursor-pointer border-b border-carbon-blue-300"
            onClick={() =>
              setOpenPicker(openPicker === "sortOrder" ? null : "sortOrder")
            }
          >
            {sortOrder}
          </p>

          {openPicker === "sortOrder" && (
            <EnumPicker
              options={sortOrderOptions}
              current={sortOrder}
              onSelect={(val) => {
                setSortOrder(val)
                setOpenPicker(null)
              }}
            />
          )}
        </div>

        {/* Date Format */}
        <div className="relative">
          <label className="block text-sm text-carbon-blue-500 mb-1">
            Date Format
          </label>
          <p
            className="text-lg text-carbon-blue-800 outline-none cursor-pointer border-b border-carbon-blue-300"
            onClick={() =>
              setOpenPicker(openPicker === "dateFormat" ? null : "dateFormat")
            }
          >
            {dateFormat}
          </p>

          {openPicker === "dateFormat" && (
            <EnumPicker
              options={dateFormatOptions}
              current={dateFormat}
              onSelect={(val) => {
                setDateFormat(val)
                setOpenPicker(null)
              }}
            />
          )}
        </div>
      </section>
    </main>
  )
}
