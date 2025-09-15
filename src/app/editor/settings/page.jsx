"use client"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { env } from "./../../lib/env"
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
      defaultSortOrder
      defaultDateFormat
    }
  }
`

const GET_SETTING_ENUMS = gql`
  query GetSettingEnums {
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
      defaultSortOrder
      defaultDateFormat
    }
  }
`

const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      success
      message
    }
  }
`

export default function SettingsPage() {
  const router = useRouter()

  // ✅ Queries
  const { data, loading, error } = useQuery(GET_APP_SETTINGS, {
    fetchPolicy: "no-cache",
  })
  const { data: enumData } = useQuery(GET_SETTING_ENUMS)
  const [updateSettingMutation] = useMutation(UPDATE_APP_SETTING)
  const [logoutUserMutation] = useMutation(LOGOUT_USER)

  // ✅ State
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")

  const [settingId, setSettingId] = useState("")
  const [appName, setAppName] = useState("App Name")
  const [sortOrder, setSortOrder] = useState("ALPHABETICAL")
  const [dateFormat, setDateFormat] = useState("EEE_DD_MMM_YYYY")
  const [openPicker, setOpenPicker] = useState(null)

  const sortOrderOptions = enumData?.sortOrder?.enumValues || []
  const dateFormatOptions = enumData?.dateFormat?.enumValues || []

  // ✅ Load from localStorage first
  useEffect(() => {
    const stored = localStorage.getItem("appSettings")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.id) setSettingId(parsed.id)
        if (parsed.applicationName) setAppName(parsed.applicationName)
        if (parsed.defaultSortOrder) setSortOrder(parsed.defaultSortOrder)
        if (parsed.defaultDateFormat) setDateFormat(parsed.defaultDateFormat)
      } catch (err) {
        console.warn("⚠️ Failed to parse localStorage appSettings:", err)
      }
    }
  }, [])

  // ✅ Sync fresh GraphQL data
  useEffect(() => {
    const setting = data?.appSettings?.[0]
    if (setting) {
      setSettingId(setting.id)
      setAppName(setting.applicationName)
      setSortOrder(setting.defaultSortOrder)
      setDateFormat(setting.defaultDateFormat)
    }
  }, [data])

  // ✅ Save handler
  const handleSave = async () => {
    if (!settingId) return
    setSaving(true)
    try {
      const result = await updateSettingMutation({
        variables: {
          id: settingId,
          data: {
            applicationName: appName.trim(),
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

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      const { data } = await logoutUserMutation()
      if (data?.logoutUser?.success) {
        localStorage.removeItem("appSettings")
        localStorage.removeItem("authToken")

        setToastType("success")
        setToastMessage("✅ Logged out successfully")

        setTimeout(() => {
          router.push("/")
        }, 500)
      } else {
        setToastType("error")
        setToastMessage(data?.logoutUser?.message || "Logout failed!")
      }
    } catch (err) {
      console.error("Logout failed:", err)
      setToastType("error")
      setToastMessage("❌ Failed to log out. Try again.")
    }
  }

  // ✅ Export handler
  const handleExport = async () => {
    try {
      const res = await fetch(`${env.REST_API_URL}export`, {
        method: "GET",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Export failed")

      const disposition = res.headers.get("Content-Disposition")
      let filename = "export.xlsx"
      if (disposition) {
        const utf8Match = disposition.match(/filename\*\=UTF-8''([^;]+)/)
        if (utf8Match?.[1]) {
          filename = decodeURIComponent(utf8Match[1])
        } else {
          const simpleMatch = disposition.match(/filename="(.+?)"/)
          if (simpleMatch?.[1]) {
            filename = simpleMatch[1]
          }
        }
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed", err)
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
      <Toast
        className="mt-0"
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-carbon-blue-900">
          Settings
        </h1>

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
              Save
            </>
          )}
        </button>
      </header>

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

        {/* Default Date Format */}
        <div className="font-medium">Default Date Format</div>
        <div
          className="cursor-pointer"
          onClick={() =>
            setOpenPicker(openPicker === "dateFormat" ? null : "dateFormat")
          }
        >
          {dateFormat}
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

        {/* Export Data */}
        <div className="font-medium">Export Data</div>
        <div>
          <button
            onClick={handleExport}
            className="text-carbon-blue-700 hover:underline"
          >
            Export
          </button>
        </div>

        {/* Logout */}
        <div className="font-medium">Logout</div>
        <div>
          <button
            onClick={handleLogout}
            className="text-carbon-blue-700 hover:underline"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  )
}
