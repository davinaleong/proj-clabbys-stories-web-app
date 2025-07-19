"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { env } from "../lib/env"

// Assets
import whiteLogo from "./../assets/logos/logo-white.png"
import circleQuestionMarkIcon from "./../assets/icons/circle-question-mark.svg"
import grid2x2Icon from "./../assets/icons/grid-2x2.svg"
import imageIcon from "./../assets/icons/image.svg"
import settingsIcon from "./../assets/icons/settings.svg"
import menuIcon from "./../assets/icons/menu.svg"
import xIcon from "./../assets/icons/x.svg"

export default function EditorLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-pastel-pink-500 flex flex-col">
      {/* Navbar */}
      <header className="bg-carbon-blue-500 text-white w-full px-6 py-4 flex justify-between items-center">
        {/* Logo + App Name */}
        <Link href="/editor" className="flex items-center gap-3">
          <Image src={whiteLogo} alt="Logo" width={40} height={40} />
          <span className="font-semibold text-lg">{env.APP_NAME}</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6">
          <Link href="#" className="flex gap-2 items-center hover:underline">
            <Image src={grid2x2Icon} alt="Grid Icon" width={16} height={16} />{" "}
            Galleries
          </Link>
          <Link href="#" className="flex gap-2 items-center hover:underline">
            <Image src={imageIcon} alt="Image Icon" width={16} height={16} />{" "}
            Photos
          </Link>
          <Link href="#" className="flex gap-2 items-center hover:underline">
            <Image
              src={settingsIcon}
              alt="Settings Icon"
              width={16}
              height={16}
            />{" "}
            Settings
          </Link>
          <Link href="#" className="flex gap-2 items-center hover:underline">
            <Image
              src={circleQuestionMarkIcon}
              alt="FAQ Icon"
              width={16}
              height={16}
            />{" "}
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
            href="#"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image src={grid2x2Icon} alt="Grid Icon" width={16} height={16} />{" "}
            Galleries
          </Link>
          <Link
            href="#"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image src={imageIcon} alt="Image Icon" width={16} height={16} />{" "}
            Photos
          </Link>
          <Link
            href="#"
            className="flex gap-2 items-center py-2 px-6 hover:bg-carbon-blue-700"
          >
            <Image
              src={settingsIcon}
              alt="Settings Icon"
              width={16}
              height={16}
            />{" "}
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
            />{" "}
            FAQ
          </Link>
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  )
}
