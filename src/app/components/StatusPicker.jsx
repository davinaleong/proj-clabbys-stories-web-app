"use client"
import { useEffect, useRef } from "react"

export default function StatusPicker({
  anchorRef,
  isOpen,
  options = [],
  currentStatus,
  onClose,
  onSelect,
}) {
  const menuRef = useRef(null)

  // ✅ Close when clicking outside
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
      className="absolute mt-2 bg-white p-3 rounded-sm shadow-lg w-48 z-50"
      style={{
        top: anchorRef.current?.offsetHeight ?? 0,
        left: 0,
      }}
    >
      <div className="text-sm font-semibold text-gray-700 mb-2">
        Select Status
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.name}
            onClick={() => {
              onSelect(opt.name)
              onClose()
            }}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm ${
              currentStatus === opt.name
                ? "bg-carbon-blue-500 text-white"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
          >
            {opt.name === "DRAFT" ? "Draft" : "Published"}
          </button>
        ))}
      </div>
    </div>
  )
}
