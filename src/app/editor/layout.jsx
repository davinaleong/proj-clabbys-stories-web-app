"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { gql, useQuery } from "@apollo/client"
import { env } from "../lib/env"

// ✅ Assets
import whiteLogo from "./../assets/logos/logo-white.png"
import circleQuestionMarkIcon from "./../assets/icons/circle-question-mark.svg"
import grid2x2Icon from "./../assets/icons/grid-2x2.svg"
import imageIcon from "./../assets/icons/image.svg"
import settingsIcon from "./../assets/icons/settings.svg"
import menuIcon from "./../assets/icons/menu.svg"
import xIcon from "./../assets/icons/x.svg"

// ✅ Query
const GET_APP_SETTING_BY_ID = gql`
  query GetAppSetting($id: ID!) {
    appSetting(id: $id) {
      id
      applicationName
      lightboxMode
      defaultSortOrder
      defaultDateFormat
    }
  }
`

export default function EditorLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
  } = useQuery(GET_APP_SETTING_BY_ID, {
    variables: { id: env.APP_SETTINGS_UUID },
    fetchPolicy: "network-only", // ✅ ensures latest
  })

  const appSetting = settingsData?.appSetting

  // ✅ Save settings to localStorage when loaded
  useEffect(() => {
    if (appSetting) {
      localStorage.setItem("appSettings", JSON.stringify(appSetting))
      console.log("✅ App settings saved to localStorage:", appSetting)
    }
  }, [appSetting])

  // ✅ Determine navbar title
  const appName = appSetting?.applicationName || "Clabby's Stories"

  if (settingsError) {
    console.warn("⚠️ Failed to fetch settings:", settingsError.message)
  }

  return (
    <div className="min-h-screen bg-pastel-pink-500 flex flex-col">
      {/* Navbar */}
      <header className="bg-carbon-blue-500 text-white w-full px-6 py-4 flex justify-between items-center">
        {/* Logo + App Name */}
        <Link href="/editor" className="flex items-center gap-3">
          <Image src={whiteLogo} alt="Logo" width={40} height={40} />
          <span className="font-serif font-semibold text-lg">
            {settingsLoading ? "Loading..." : `${appName} - Editor`}
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          <Link
            href="/editor"
            className="flex gap-2 items-center hover:underline"
          >
            <Image src={grid2x2Icon} alt="Grid Icon" width={16} height={16} />
            Galleries
          </Link>
          <Link href="#" className="flex gap-2 items-center hover:underline">
            <Image src={imageIcon} alt="Image Icon" width={16} height={16} />
            Photos
          </Link>
          <Link
            href="/editor/settings"
            className="flex gap-2 items-center hover:underline"
          >
            <Image
              src={settingsIcon}
              alt="Settings Icon"
              width={16}
              height={16}
            />
            Settings
          </Link>
          <Link href="#" className="flex gap-2 items-center hover:underline">
            <Image
              src={circleQuestionMarkIcon}
              alt="FAQ Icon"
              width={16}
              height={16}
            />
            FAQ
          </Link>
        </nav>

        {/* Mobile Hamburger → X Toggle */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1"
        >
          <Image
            src={menuOpen ? xIcon : menuIcon}
            alt={menuOpen ? "Close Menu" : "Menu Icon"}
            width={20}
            height={20}
          />
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="bg-carbon-blue-500 text-white flex flex-col md:hidden">
          <Link
            href="/editor"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image src={grid2x2Icon} alt="Grid Icon" width={16} height={16} />
            Galleries
          </Link>
          <Link
            href="#"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image src={imageIcon} alt="Image Icon" width={16} height={16} />
            Photos
          </Link>
          <Link
            href="/editor/settings"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image
              src={settingsIcon}
              alt="Settings Icon"
              width={16}
              height={16}
            />
            Settings
          </Link>
          <Link
            href="#"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image
              src={circleQuestionMarkIcon}
              alt="FAQ Icon"
              width={16}
              height={16}
            />
            FAQ
          </Link>
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  )
}
