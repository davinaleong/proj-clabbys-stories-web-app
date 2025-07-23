"use client"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useState, useEffect } from "react"
import EnumPicker from "./../../components/EnumPicker"
import Toast from "./../../components/Toast"
import Image from "next/image"
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
  const { data, loading, error } = useQuery(GET_APP_SETTINGS, {
    fetchPolicy: "no-cache",
  })
  const { data: enumData } = useQuery(GET_SETTING_ENUMS)
  const [updateSettingMutation] = useMutation(UPDATE_APP_SETTING)

  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  const [settingId, setSettingId] = useState("")
  const [appName, setAppName] = useState("App Name")
  const [lightboxMode, setLightboxMode] = useState("BLACK")
  const [sortOrder, setSortOrder] = useState("ALPHABETICAL")
  const [dateFormat, setDateFormat] = useState("EEE_DD_MMM_YYYY")

  const [openPicker, setOpenPicker] = useState(null)

  const lightboxOptions = enumData?.lightbox?.enumValues || []
  const sortOrderOptions = enumData?.sortOrder?.enumValues || []
  const dateFormatOptions = enumData?.dateFormat?.enumValues || []

  useEffect(() => {
    const stored = localStorage.getItem("appSettings")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.id) setSettingId(parsed.id)
        if (parsed.applicationName) setAppName(parsed.applicationName)
        if (parsed.lightboxMode) setLightboxMode(parsed.lightboxMode)
        if (parsed.defaultSortOrder) setSortOrder(parsed.defaultSortOrder)
        if (parsed.defaultDateFormat) setDateFormat(parsed.defaultDateFormat)
      } catch (err) {
        console.warn("⚠️ Failed to parse localStorage appSettings:", err)
      }
    }
  }, [])

  useEffect(() => {
    const setting = data?.appSettings?.[0]
    if (setting) {
      setSettingId(setting.id)
      setAppName(setting.applicationName)
      setLightboxMode(setting.lightboxMode)
      setSortOrder(setting.defaultSortOrder)
      setDateFormat(setting.defaultDateFormat)
    }
  }, [data])

  const handleSave = async () => {
    if (!settingId) return
    setSaving(true)
    try {
      const result = await updateSettingMutation({
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

      if (result?.data?.updateAppSetting) {
        localStorage.setItem(
          "appSettings",
          JSON.stringify(result.data.updateAppSetting)
        )
      }

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

  if (loading && !appName) {
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
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
      {/* ✅ Toast */}
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      {/* ✅ Page Title */}
      <h1 className="text-3xl font-serif text-carbon-blue-900 mb-8">
        Settings
      </h1>

      {/* ✅ Two-column grid */}
      <section className="grid grid-cols-2 gap-y-6 text-carbon-blue-900">
        {/* App Name */}
        <div className="font-medium">App Name</div>
        <div
          className="cursor-text"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setAppName(e.currentTarget.textContent)}
        >
          {appName}
        </div>

        {/* Lightbox Mode */}
        <div className="font-medium">Lightbox Mode</div>
        <div
          className="cursor-pointer"
          onClick={() =>
            setOpenPicker(openPicker === "lightbox" ? null : "lightbox")
          }
        >
          {lightboxMode}
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

        {/* Default Sort Order */}
        <div className="font-medium">Default Sort Order</div>
        <div
          className="cursor-pointer"
          onClick={() =>
            setOpenPicker(openPicker === "sortOrder" ? null : "sortOrder")
          }
        >
          {sortOrder}
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

        {/* Export Data */}
        <div className="font-medium">Export Data</div>
        <div>
          <button className="text-carbon-blue-700 hover:underline">
            Export
          </button>
        </div>

        {/* Logout */}
        <div className="font-medium">Logout</div>
        <div>
          <button className="text-carbon-blue-700 hover:underline">
            Logout
          </button>
        </div>
      </section>

      {/* ✅ Save button at bottom */}
      <div className="mt-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex gap-2 items-center px-5 py-2 rounded-md transition ${
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
              Save Changes
            </>
          )}
        </button>
      </div>
    </main>
  )
}
