"use client"
import React from "react"

export default function EnumDropdown({ options, current, onSelect }) {
  if (!options || options.length === 0) return null

  return (
    <div className="absolute mt-2 bg-white p-3 rounded-sm shadow-lg w-48 z-50">
      <div className="text-sm font-semibold text-gray-700 mb-2">
        Select Value
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.name}
            onClick={() => onSelect(opt.name)}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm ${
              current === opt.name
                ? "bg-carbon-blue-500 text-white"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  )
}
