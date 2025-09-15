"use client"
import { useEffect, useRef } from "react"
import LIGHTBOX_MODES from "./../db/lightbox-modes" // adjust the path if needed

export default function LightboxPicker({
  anchorRef,
  isOpen,
  currentMode,
  onClose,
  onSelect,
}) {
  const menuRef = useRef(null)

  // ✅ Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }

    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute mt-2 bg-white p-3 rounded-sm shadow-lg w-56 z-50"
      style={{
        top: anchorRef.current?.offsetHeight ?? 0,
        left: 0,
      }}
    >
      <div className="text-sm font-semibold text-gray-700 mb-2">
        Select Lightbox Mode
      </div>

      <div className="space-y-2">
        {Object.entries(LIGHTBOX_MODES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              onSelect(key) // returns the mode key (BLACK, BLURRED, SLIDESHOW)
              onClose()
            }}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm ${
              currentMode === key
                ? "bg-carbon-blue-500 text-white"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
