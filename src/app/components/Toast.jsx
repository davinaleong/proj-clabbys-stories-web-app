// components/Toast.jsx
"use client"

import { useEffect } from "react"

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose?.()
      }, 3000) // Auto-dismiss after 3s
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!message) return null

  const bgColor =
    type === "error"
      ? "bg-red-600"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-green-600"

  return (
    <div
      className={`fixed top-5 right-5 ${bgColor} text-white px-4 py-2 rounded shadow-lg animate-fade-in-out`}
    >
      {message}
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}
