"use client"

import { useState, useEffect } from "react"
import { getFromLocalStorage } from "./../../utils/local-storage"

// ✅ Default fallback
const DEFAULT_APP_NAME = "My"

export default function FaqPage() {
  const [appName, setAppName] = useState(DEFAULT_APP_NAME)

  // ✅ Fetch localStorage only on client
  useEffect(() => {
    const stored = getFromLocalStorage("appSettings")
    if (stored?.applicationName) {
      setAppName(stored.applicationName)
    }
  }, [])

  const nameWithSuffix = `${appName} Editor`
  const snakeCaseName = appName.replace(/\s+/g, "_").toLowerCase()

  const FAQ_CONTENT = [
    {
      q: `What is the ${nameWithSuffix}?`,
      a: `The ${nameWithSuffix} is a secure web interface for managing galleries, photos, and app settings of ${appName}. It’s designed for admins or editors to easily create, organize, and publish content.`,
    },
    {
      q: "How do I log in to the Editor?",
      a: "Log in with your registered email and password. After logging in, you’ll be redirected to the Galleries Dashboard. If you forget your credentials, contact the administrator.",
    },
    {
      q: "What can I do in the Editor?",
      a: "You can create and manage galleries, upload photos, reorder them via drag-and-drop, change app settings (name, sort order, lightbox mode, date format), and export your data as an Excel file.",
    },
    {
      q: "What is the difference between Draft, Private, and Published galleries?",
      a: (
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Draft:</b> Only visible in the Editor, not published anywhere.
          </li>
          <li>
            <b>Private:</b> Accessible only with a secret link/passphrase.
          </li>
          <li>
            <b>Published:</b> Publicly accessible to viewers.
          </li>
        </ul>
      ),
    },
    {
      q: "How do I upload photos?",
      a: "Open a gallery, click Upload Photos, select multiple images from your device, and they’ll automatically upload to Cloudinary.",
    },
    {
      q: "How do I reorder photos?",
      a: "In the gallery view, simply drag and drop photos into the desired order. Changes are auto-saved.",
    },
    {
      q: "What are the Lightbox Modes in Settings?",
      a: (
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <b>Black:</b> Displays photos in a black background lightbox.
          </li>
          <li>
            <b>Blurred:</b> Uses a blurred version of the image as background.
          </li>
        </ul>
      ),
    },
    {
      q: "How does the Default Sort Order affect galleries?",
      a: (
        <>
          Photos can be displayed as:
          <ul className="list-disc pl-5 space-y-1">
            <li>Newest first</li>
            <li>Oldest first</li>
            <li>Alphabetical A–Z</li>
            <li>Alphabetical Z–A</li>
          </ul>
        </>
      ),
    },
    {
      q: "How do I export data from the Editor?",
      a: `Go to Settings → Export Data → Click Export. The app generates an Excel file like \`20250722_153045_${snakeCaseName}_export.xlsx\`, containing Users, Galleries, and Photos (with sensitive fields omitted).`,
    },
    {
      q: "How do I log out?",
      a: "Go to Settings → Logout. This clears your session and redirects you to the homepage.",
    },
    {
      q: "Where is my data stored?",
      a: "Photos are stored securely on Cloudinary, and all metadata (galleries, settings, users) are stored in a PostgreSQL database via Prisma.",
    },
  ]

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-carbon-blue-900 mb-6">
          FAQ
        </h1>
      </header>

      <section className="space-y-6">
        {FAQ_CONTENT.map((item, idx) => (
          <div key={idx} className="border-b border-carbon-blue-200 pb-4">
            <h2 className="text-lg font-semibold text-carbon-blue-800">
              {item.q}
            </h2>
            <div className="mt-2 text-carbon-blue-700 leading-relaxed">
              {item.a}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
